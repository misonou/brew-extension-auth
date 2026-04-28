import { addExtension } from "brew-js/app";
import { combinePath } from "brew-js/util/path";
import { createObjectStorage } from "brew-js/util/storage";
import { always, catchAsync, defineObservableProperty, errorWithCode, extend, isError, isErrorWithCode, isFunction, makeArray, makeAsync, map, mapRemove, pick, pipe, reject, resolve, resolveAll, retryable, throws } from "zeta-dom/util";
import { reportError } from "zeta-dom/dom";
import * as AuthError from "./errorCode.js";

const CACHE_KEY = 'brew.auth';

export default addExtension('auth', ['?router'], function (app, options) {
    var setUser = defineObservableProperty(app, 'user', null, true);
    var providers = makeArray(options.providers || options.provider);
    var providerParams = {
        interaction: options.interaction || 'redirect',
    };
    var contexts = new Map();
    var redirectUri = combinePath(location.origin, app.route ? app.toHref('/') : location.pathname);
    var sessionCache = app.cache || createObjectStorage(sessionStorage, 'brew.auth');
    var previousState = sessionCache.get(CACHE_KEY) || {};
    var isNewSession = performance.navigation.type === 0;
    var refreshLocks = {};
    var initPromise;
    var currentProvider;
    var currentResult;

    function initProvider(provider) {
        var context = {
            interaction: providerParams.interaction,
            redirectUri: redirectUri,
            challenge: function () { },
            revokeSession: function (accountId) {
                if (currentProvider === provider && (!accountId || currentResult.accountId === accountId)) {
                    currentProvider = null;
                    if (!app.emit('sessionEnded')) {
                        handleLogout();
                    }
                }
            }
        };
        contexts.set(provider, context);
        return makeAsync(provider.init).call(provider, context).then(function () {
            if (isNewSession && previousState.provider === provider.key && previousState.returnPath) {
                return provider.handleLoginRedirect(context);
            }
        }).then(function (result) {
            return result || provider.getActiveAccount(context);
        }).catch(function (e) {
            if (!isErrorWithCode(e, AuthError.invalidCredential)) {
                reportError(e);
            }
        });
    }

    function callProviderGuarded() {
        var fn = callProviderGuarded.call.apply(callProviderGuarded.bind, arguments);
        if (initPromise) {
            return initPromise.then(function () {
                return fn();
            });
        }
        return makeAsync(fn)();
    }

    function filterByProp(arr, key, value) {
        return value === undefined ? arr : arr.filter(function (v) {
            return v[key] === value;
        });
    }

    function findProvider(params) {
        if (params.provider) {
            return filterByProp(providers, 'key', params.provider)[0];
        }
        var matched = providers;
        matched = filterByProp(matched, 'authType', params.authType);
        matched = filterByProp(matched, 'providerType', params.providerType);
        if (params.loginHint) {
            return resolve(0).then(function next(index) {
                var provider = matched[index];
                return provider && callProviderGuarded(provider.isHandleable, provider, params.loginHint).then(function (v) {
                    return v ? provider : next(index + 1);
                });
            });
        }
        if (!matched[1]) {
            return matched[0];
        }
    }

    function getCacheableState() {
        return currentProvider && {
            provider: currentProvider.key,
            accountId: currentResult.accountId
        };
    }

    function setSessionState(provider, returnPath) {
        var before = getCacheableState();
        sessionCache.set(CACHE_KEY, { provider, returnPath, before });
    }

    function popSessionState() {
        var state = mapRemove(sessionCache, CACHE_KEY) || {};
        var isCurrent = state.provider === (currentProvider ? currentProvider.key : '');
        if (isCurrent && state.returnPath && app.navigate) {
            catchAsync(app.navigate(state.returnPath));
        }
        if (currentProvider) {
            sessionCache.set(CACHE_KEY, getCacheableState());
            currentProvider.setActiveAccount(currentResult, contexts.get(currentProvider));
        }
    }

    function setCurrentResult(provider, result) {
        var previous = getCacheableState() || previousState.before || previousState;
        var previousProvider = previous.provider && findProvider(previous);
        if (previousProvider && provider !== previousProvider) {
            previousProvider.setActiveAccount(null, contexts.get(previousProvider));
        }
        currentProvider = provider;
        currentResult = result;
        return previous;
    }

    function isCurrent(provider, result) {
        return provider && provider === currentProvider && result.accountId === currentResult.accountId;
    }

    function getAuthResult(provider, result) {
        return {
            provider: provider.key,
            providerType: provider.providerType,
            account: result.account,
            accountId: result.accountId,
            username: result.username || result.accountId,
            name: result.name || result.username || result.accountId,
            email: result.email || null,
            avatarUrl: result.avatarUrl || null
        };
    }

    function resolveUser(provider, result) {
        if (!options.resolveUser) {
            return resolve(result.account);
        }
        return makeAsync(options.resolveUser)(getAuthResult(provider, result));
    }

    function handleLogin(provider, result) {
        var previousResult = currentResult;
        var previous = setCurrentResult(provider, result);
        var resumed = (previous.provider === provider.key && previous.accountId === result.accountId) || (!previous.provider && app.readyState !== 'ready');
        return resolveUser(provider, result).then(function (user) {
            setUser(user);
            popSessionState();
            app.emit('login', {
                user: user,
                sessionResumed: resumed,
                sessionChanged: !resumed && !!previous.accountId,
                interaction: app.readyState === 'ready' ? 'user' : previousState.returnPath ? 'redirect' : 'none'
            });
            previousState = {};
        }, function (error) {
            if (previousResult) {
                currentProvider = findProvider(previousResult);
                currentResult = previousResult;
            } else {
                handleLogout();
            }
            throw error;
        });
    }

    function handleLogout() {
        var previousProvider = currentProvider;
        var user = app.user;
        setCurrentResult(null, null);
        setUser(null);
        popSessionState();
        if (user || previousState.accountId) {
            app.emit('logout', {
                user: user,
                interaction: previousProvider ? 'user' : previousState.returnPath ? 'redirect' : 'none'
            });
        }
        previousState = {};
    }

    function acquireToken(provider, params) {
        var key = provider.key + ':' + params.accountId;
        if (!refreshLocks[key]) {
            refreshLocks[key] = callProviderGuarded(provider.refresh, provider, params, contexts.get(provider));
            always(refreshLocks[key], function (resolved, result) {
                if (resolved && isCurrent(provider, params)) {
                    currentResult = result;
                }
                delete refreshLocks[key];
            });
        }
        return refreshLocks[key];
    }

    function callProvider(provider, method, params, context) {
        var promise = callProviderGuarded(provider[method], provider, extend({}, providerParams, params), context || contexts.get(provider));
        promise.catch(function () {
            sessionCache.set(CACHE_KEY, getCacheableState());
        });
        return promise;
    }

    function runWithChallenge(provider, params, callback) {
        return new Promise(function (resolve, reject) {
            var sendResult = resolve;
            var challenge = function (challenge, value, callback) {
                return new Promise(function (resolve, reject) {
                    if (params.silent) {
                        return reject(errorWithCode(AuthError.challengeRequired));
                    }
                    callback = retryable(callback || pipe, resolve);
                    sendResult({
                        challenge: challenge,
                        value: value,
                        continueWith: function (response) {
                            return new Promise(function (resolve, reject) {
                                sendResult = resolve;
                                callback(response).then(null, reject);
                            });
                        }
                    });
                });
            };
            callback(extend({}, contexts.get(provider), { challenge })).then(function (result) {
                sendResult(result);
            }, reject);
        });
    }

    app.define({
        getAllAccounts: function () {
            var results = providers.map(function (provider) {
                return callProviderGuarded(provider.getAllAccounts || provider.getActiveAccount, provider, contexts.get(provider)).then(function (results) {
                    return makeArray(results).map(function (v) {
                        return getAuthResult(provider, v);
                    });
                });
            });
            return resolveAll(results, function (arr) {
                return map(arr, pipe);
            });
        },
        resolveAuthProvider: function (params) {
            return resolve(findProvider(params)).then(function (provider) {
                return provider ? pick(provider, ['key', 'authType', 'providerType']) : null;
            });
        },
        acquireToken: function (params) {
            var force = params === true;
            var provider, callback;
            if (params && params.provider) {
                provider = findProvider(params) || errorWithCode(AuthError.noProvider);
                params = isCurrent(provider, params) ? currentResult : params;
            } else {
                callback = isFunction(params);
                provider = currentProvider;
                params = currentResult;
            }
            if (isError(provider)) {
                return reject(provider);
            }
            callback = callback || pipe;
            if (!provider) {
                return makeAsync(callback)(null, false);
            }
            if (!force && params.expiresOn > Date.now()) {
                return makeAsync(callback)(params.accessToken, true);
            }
            var throwOnError = force || params !== currentResult;
            return acquireToken(provider, params).then(function (result) {
                return callback(result.accessToken, false);
            }, function (error) {
                return throwOnError ? throws(error) : callback(params.accessToken, false);
            });
        },
        login: function (params) {
            params = params || {};
            return resolve(findProvider(params)).then(function (provider) {
                if (!provider) {
                    throw errorWithCode(AuthError.noProvider);
                }
                if (isCurrent(provider, params)) {
                    return resolve();
                }
                return always(params.accountId && acquireToken(provider, params), function (resolved, result) {
                    if (resolved && result) {
                        return handleLogin(provider, result);
                    }
                    setSessionState(provider.key, params.returnPath || options.postLoginPath || app.path || location.pathname);
                    return runWithChallenge(provider, params, function (context) {
                        return callProvider(provider, 'login', pick(params, ['accountId', 'loginHint', 'password', 'passkey']), context).then(handleLogin.bind(0, provider));
                    });
                });
            });
        },
        logout: function (params) {
            if (!currentProvider) {
                return resolve(handleLogout());
            }
            params = params || {};
            setSessionState('', params.returnPath || options.postLogoutPath || app.path || location.pathname);
            return callProvider(currentProvider, 'logout', pick(currentResult, ['accountId'])).then(handleLogout);
        }
    });

    app.beforeInit(function () {
        var promise = resolveAll(providers.map(initProvider));
        initPromise = always(promise, function () {
            initPromise = null;
        });
        return promise.then(function (results) {
            var index = providers.indexOf(findProvider(previousState));
            if (!results[index]) {
                index = results.findIndex(pipe);
            }
            return index >= 0 ? handleLogin(providers[index], results[index]).catch(reportError) : handleLogout();
        });
    });
});
