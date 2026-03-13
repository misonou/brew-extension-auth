import { bind } from "zeta-dom/domUtil";
import { catchAsync, errorWithCode, exclude, noop, reject, resolve } from "zeta-dom/util";
import * as AuthError from "./errorCode.js";

const AuthProvider = {
    from: function (key, client) {
        var storage = window.localStorage;
        var storageKey = 'brew.auth.' + key;
        var storageKeyID = storageKey + '.id';
        var currentData;

        function getCachedData() {
            try {
                return JSON.parse(storage[storageKey]);
            } catch (e) { }
        }

        function setCurrentData(data) {
            if (data) {
                storage[storageKey] = JSON.stringify(exclude(data, ['account']));
                storage[storageKeyID] = data.accountId;
            } else {
                delete storage[storageKey];
                delete storage[storageKeyID];
            }
            currentData = data;
            return data;
        }

        return {
            key: key,
            authType: client.authType,
            providerType: client.providerType,
            init: function (context) {
                bind(window, 'storage', function (e) {
                    if (e.storageArea === storage && ((e.key === storageKeyID && e.oldValue) || e.key === null)) {
                        currentData = null;
                        context.revokeSession(e.oldValue);
                    }
                });
                return (client.init || noop).call(client, context);
            },
            getAllAccounts: function (context) {
                if (currentData) {
                    return [currentData];
                }
                var cached = getCachedData();
                return cached && catchAsync(client.refresh(cached, context).then(setCurrentData));
            },
            getActiveAccount: function (context) {
                var cached = getCachedData();
                return cached && client.refresh(cached, context).then(setCurrentData);
            },
            handleLoginRedirect: function (context) {
                return resolve((client.handleLoginRedirect || noop).call(client, context)).then(setCurrentData);
            },
            login: function (params, context) {
                return client.login(params, context).then(setCurrentData);
            },
            logout: function (params, context) {
                var cached = getCachedData();
                if (!cached || cached.accountId !== params.accountId) {
                    return resolve();
                }
                return client.logout(cached, context).then(setCurrentData.bind(0, undefined));
            },
            refresh: function (params, context) {
                var cached = getCachedData();
                if (!cached || cached.accountId !== params.accountId) {
                    return reject(errorWithCode(AuthError.userNotLoggedIn));
                }
                return client.refresh(cached, context).then(setCurrentData);
            },
            isHandleable: function (loginHint) {
                return client.isHandleable(loginHint);
            }
        };
    }
};
export default AuthProvider;
