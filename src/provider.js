import { bind } from "zeta-dom/domUtil";
import { catchAsync, each, errorWithCode, exclude, makeArray, noop, pipe, reject, resolve, resolveAll } from "zeta-dom/util";
import * as AuthError from "./errorCode.js";

const AuthProvider = {
    from: function (key, client) {
        var storage = window.localStorage;
        var storageKey = 'brew.auth.' + key;
        var storageKeyID = storageKey + '.id';
        var currentData;

        function isAccountData(data, accountId) {
            return data && data.accountId === accountId && data;
        }

        function parseCachedData(data) {
            try {
                return makeArray(JSON.parse(data || '[]'));
            } catch (e) {
                return [];
            }
        }

        function getCachedData(accountId) {
            if (accountId !== undefined) {
                return getCachedData().find(function (v) {
                    return isAccountData(v, accountId);
                });
            }
            return parseCachedData(storage[storageKey]);
        }

        function setCachedData(data, remove) {
            var cached = getCachedData();
            var pos = cached.findIndex(function (v) {
                return isAccountData(v, data.accountId);
            });
            if (!remove) {
                cached.splice(pos, +(pos >= 0), exclude(data, ['account']));
                if (isAccountData(currentData, data.accountId)) {
                    currentData = data;
                }
            } else if (pos >= 0) {
                cached.splice(pos, 1);
            }
            storage[storageKey] = JSON.stringify(cached);
            return data;
        }

        return {
            key: key,
            authType: client.authType,
            providerType: client.providerType,
            init: function (context) {
                bind(window, 'storage', function (e) {
                    if (e.storageArea === storage && e.key === storageKey) {
                        var newData = parseCachedData(e.newValue).map(function (v) {
                            return v.accountId;
                        });
                        each(parseCachedData(e.oldValue), function (i, v) {
                            if (newData.indexOf(v.accountId) < 0) {
                                context.revokeSession(v.accountId);
                            }
                        });
                    }
                });
                return (client.init || noop).call(client, context);
            },
            getAllAccounts: function (context) {
                var promise = getCachedData().map(function (v) {
                    return isAccountData(currentData, v.accountId) || catchAsync(client.refresh(v, context).then(setCachedData));
                });
                return resolveAll(promise, function (arr) {
                    return arr.filter(pipe);
                });
            },
            getActiveAccount: function (context) {
                var cached = getCachedData(storage[storageKeyID] || '');
                return cached && client.refresh(cached, context).then(setCachedData);
            },
            setActiveAccount: function (cached) {
                if (!cached) {
                    currentData = null;
                    delete storage[storageKeyID];
                } else {
                    currentData = cached;
                    storage[storageKeyID] = cached.accountId;
                }
            },
            handleLoginRedirect: function (context) {
                return resolve((client.handleLoginRedirect || noop).call(client, context)).then(function (v) {
                    return v && setCachedData(v);
                });
            },
            login: function (params, context) {
                return client.login(params, context).then(setCachedData);
            },
            logout: function (params, context) {
                var cached = isAccountData(currentData, params.accountId) || getCachedData(params.accountId);
                if (!cached) {
                    return resolve();
                }
                return client.logout(cached, context).then(setCachedData.bind(0, cached, true));
            },
            refresh: function (params, context) {
                var cached = isAccountData(currentData, params.accountId) || getCachedData(params.accountId);
                if (!cached) {
                    return reject(errorWithCode(AuthError.userNotLoggedIn));
                }
                return client.refresh(cached, context).then(setCachedData);
            },
            isHandleable: function (loginHint) {
                return client.isHandleable(loginHint);
            }
        };
    }
};
export default AuthProvider;
