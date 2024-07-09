import { bind } from "zeta-dom/domUtil";
import { exclude } from "zeta-dom/util";

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
            },
            getActiveAccount: function () {
                var cached = getCachedData();
                return cached && client.refresh(cached).then(setCurrentData);
            },
            handleLoginRedirect: function () {
            },
            login: function (params) {
                return client.login(params).then(setCurrentData);
            },
            logout: function (params) {
                return client.logout(params).then(setCurrentData.bind(0, undefined));
            },
            refresh: function (cached) {
                return client.refresh(cached).then(setCurrentData);
            },
            isHandleable: function (loginHint) {
                return client.isHandleable(loginHint);
            }
        };
    }
};
export default AuthProvider;
