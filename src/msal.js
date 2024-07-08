import { EventType, PublicClientApplication } from "@azure/msal-browser";
import { getJSON } from "brew-js/util/common";
import { isSubPathOf } from "brew-js/util/path";
import { define, extend, is } from "zeta-dom/util";

const AUTHORITY_URI = 'https://login.microsoftonline.com/';

const MsalAuthProvider = {};
const issuerCache = {};
const multitenant = {
    common: true,
    organizations: true
};
const defaultConfig = {
    cache: {
        cacheLocation: 'localStorage'
    }
};

function clearInteractionStatus() {
    delete sessionStorage['msal.interaction.status'];
}

function getIssuerURL(domain) {
    return issuerCache[domain] || (issuerCache[domain] = getJSON(AUTHORITY_URI + domain + '/v2.0/.well-known/openid-configuration').then(function (v) {
        return v.issuer;
    }, function (xhr) {
        if (xhr.status === 400) {
            return '';
        }
        delete issuerCache[domain];
    }));
}

/**
 * @param {string} key
 * @param {PublicClientApplication} client
 * @param {*} options
 */
function createProvider(key, client, options) {
    var scopes = options.scopes;

    function refresh(account, context) {
        return client.acquireTokenSilent({
            redirectUri: context.redirectUri,
            account: account,
            scopes: scopes
        });
    }

    function handleResult(result) {
        if (result) {
            var account = result.account;
            client.setActiveAccount(account);
            return {
                account: account,
                accountId: account.homeAccountId,
                accessToken: result.accessToken,
                expiresOn: result.expiresOn
            };
        }
    }

    return {
        key: key,
        authType: 'federated',
        providerType: 'msal',
        isHandleable: function (loginHint) {
            if (!/@(.+)$/.test(loginHint)) {
                return false;
            }
            var authority = client.getConfiguration().auth.authority;
            if (multitenant[authority.slice(AUTHORITY_URI.length)]) {
                return true;
            }
            return getIssuerURL(RegExp.$1).then(function (issuer) {
                return !!isSubPathOf(issuer, authority);
            });
        },
        init: function (context) {
            client.enableAccountStorageEvents();
            client.addEventCallback(function (message) {
                if (message.eventType === EventType.ACCOUNT_REMOVED) {
                    context.revokeSession(message.payload.homeAccountId);
                }
            });
            return client.initialize().then(function () {
                return client.handleRedirectPromise();
            }).then(function (result) {
                var account = client.getActiveAccount();
                return result || (account && refresh(account, context));
            }).then(handleResult, function () {
                client.setActiveAccount(null);
            });
        },
        refresh: function (current, context) {
            return refresh(current.account, context).then(handleResult);
        },
        login: function (params, context) {
            var request = {
                redirectUri: context.redirectUri,
                loginHint: params.loginHint,
                scopes: scopes
            };
            clearInteractionStatus();
            if (params.interaction === 'popup') {
                return client.loginPopup(request).then(handleResult);
            } else {
                return client.loginRedirect(request);
            }
        },
        logout: function (params, context) {
            var account = client.getAccount({
                homeAccountId: params.accountId
            });
            if (!params.singleLogout) {
                return client.clearCache({ account });
            }
            clearInteractionStatus();
            if (params.interaction === 'popup') {
                return client.logoutPopup({ account });
            } else {
                return client.logoutRedirect({
                    account: account,
                    postLogoutRedirectUri: context.redirectUri
                });
            }
        }
    };
}

define(MsalAuthProvider, {
    defaultConfig: defaultConfig,
    setDefault: function (config) {
        extend(true, defaultConfig, config);
    },
    create: function (key, options, authority, scopes) {
        if (typeof options === 'string') {
            options = {
                scopes: scopes,
                config: {
                    auth: {
                        clientId: options,
                        authority: authority
                    }
                }
            };
        }
        var client = is(options, PublicClientApplication) || new PublicClientApplication(extend(true, {}, defaultConfig, options.config));
        return createProvider(key, client, options);
    }
});

export default MsalAuthProvider;
