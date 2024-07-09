import { addExtension } from "brew-js/app";
import { combinePath } from "brew-js/util/path";
import { catchAsync, defineObservableProperty, errorWithCode, extend, isErrorWithCode, isFunction, makeArray, makeAsync, mapRemove, pick, pipe, reject, resolve, resolveAll, throws } from "zeta-dom/util";
import { reportError } from "zeta-dom/dom";
import * as AuthError from "./errorCode.js";

const CACHE_KEY = 'brew.auth';

export default addExtension('auth', ['router'], function (app, options) {
    var setUser = defineObservableProperty(app, 'user', null, true);
    var providers = makeArray(options.providers || options.provider);
    var providerParams = {
        interaction: options.interaction || 'redirect',
    };
    var contexts = new Map();
    var redirectUri = combinePath(location.origin, app.toHref('/'));
    var sessionCache = app.cache;
    var previousState = sessionCache.get(CACHE_KEY) || {};
    var isNewSession = performance.navigation.type === 0;
    var currentProvider;
    var currentResult;

    function initProvider(provider) {
        var context = {
            redirectUri: redirectUri,
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
                return provider && resolve(provider.isHandleable(params.loginHint)).then(function (v) {
                    return v ? provider : next(index + 1);
                });
            });
        }
        if (!matched[1]) {
            return matched[0];
        }
    }

    function setSessionState(provider, returnPath) {
        sessionCache.set(CACHE_KEY, { provider, returnPath });
    }

    function popSessionState(provider, accountId) {
        var state = mapRemove(sessionCache, CACHE_KEY) || {};
        if (state.provider === provider && state.returnPath) {
            catchAsync(app.navigate(state.returnPath));
        }
        if (provider) {
            sessionCache.set(CACHE_KEY, { provider, accountId });
        }
    }

    function handleLogin(provider, result) {
        var resumed = previousState.provider === provider.key && previousState.accountId === result.accountId;
        var data = {
            provider: provider.key,
            providerType: provider.providerType,
            account: result.account
        };
        currentProvider = provider;
        currentResult = result;
        return (options.resolveUser ? makeAsync(options.resolveUser)(data) : resolve(data.account)).then(function (user) {
            setUser(user);
            popSessionState(provider.key, result.accountId);
            app.emit('login', {
                user: user,
                sessionResumed: resumed,
                sessionChanged: !resumed && !!previousState.accountId
            });
            previousState = {};
        }, function (error) {
            handleLogout();
            throw error;
        });
    }

    function handleLogout() {
        var user = app.user;
        currentProvider = null;
        currentResult = null;
        setUser(null);
        popSessionState('');
        if (user || previousState.accountId) {
            app.emit('logout', { user });
        }
        previousState = {};
    }

    function callProvider(provider, method, params, callback) {
        var promise = makeAsync(provider[method]).call(provider, extend({}, providerParams, params), contexts.get(provider));
        promise.catch(function () {
            sessionCache.delete(CACHE_KEY);
        });
        return promise.then(callback);
    }

    app.define({
        resolveAuthProvider: function (params) {
            return resolve(findProvider(params)).then(function (provider) {
                return provider ? pick(provider, ['key', 'authType', 'providerType']) : null;
            });
        },
        acquireToken: function (callback) {
            var provider = currentProvider;
            var result = currentResult;
            var force = callback === true;
            callback = isFunction(callback) || resolve;
            if (!provider) {
                return callback(null, false);
            }
            if (!force && currentResult.expiresOn > Date.now()) {
                return callback(currentResult.accessToken, true);
            }
            return provider.refresh(currentResult, contexts.get(provider)).then(function (result) {
                if (currentProvider === provider) {
                    currentResult = result;
                }
                return callback(result.accessToken, false);
            }, function (error) {
                return force ? throws(error) : callback(result.accessToken, false);
            });
        },
        login: function (params) {
            if (currentProvider) {
                return reject(errorWithCode(AuthError.loggedIn));
            }
            params = params || {};
            return resolve(findProvider(params)).then(function (provider) {
                if (!provider) {
                    throw errorWithCode(AuthError.noProvider);
                }
                setSessionState(provider.key, params.returnPath || options.postLoginPath || app.path);
                return callProvider(provider, 'login', pick(params, ['loginHint', 'password']), handleLogin.bind(0, provider));
            });
        },
        logout: function (params) {
            if (!currentProvider) {
                return resolve(handleLogout());
            }
            params = params || {};
            setSessionState('', params.returnPath || options.postLogoutPath || app.path);
            return callProvider(currentProvider, 'logout', {
                accountId: currentResult.accountId,
                singleLogout: params.singleLogout
            }, handleLogout);
        }
    });

    app.beforeInit(function () {
        return resolveAll(providers.map(initProvider), function (results) {
            var index = providers.indexOf(findProvider(previousState));
            if (!results[index]) {
                index = results.findIndex(pipe);
            }
            return index >= 0 ? handleLogin(providers[index], results[index]).catch(reportError) : handleLogout();
        });
    });
});
