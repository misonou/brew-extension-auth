import { bind } from "zeta-dom/domUtil";
import { exclude, noop, resolve } from "zeta-dom/util";

const AuthProvider = {
    from: function (key, client) {
        var storage = window.localStorage;
        var storageKey = 'brew.auth.' + key;
        var storageKeyID = storageKey + '.id';

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
            return data;
        }

        return {
            key: key,
            authType: client.authType,
            providerType: client.providerType,
            init: function (context) {
                bind(window, 'storage', function (e) {
                    if (e.storageArea === storage && ((e.key === storageKeyID && e.oldValue) || e.key === null)) {
                        context.revokeSession(e.oldValue);
                    }
                });
                return (client.init || noop).call(client, context);
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
                return client.logout(params, context).then(setCurrentData.bind(0, undefined));
            },
            refresh: function (cached, context) {
                return client.refresh(cached, context).then(setCurrentData);
            },
            isHandleable: function (loginHint) {
                return client.isHandleable(loginHint);
            }
        };
    }
};
export default AuthProvider;
