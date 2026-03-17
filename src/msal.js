import { EventType, InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";
import { getJSON } from "brew-js/util/common";
import { isSubPathOf } from "brew-js/util/path";
import { define, errorWithCode, extend, is, map, reject } from "zeta-dom/util";
import * as AuthError from "./errorCode.js";

const AUTHORITY_URI = 'https://login.microsoftonline.com/';

const MsalAuthProvider = {};
const issuerCache = {};
const multitenant = {
    common: true,
    consumers: true,
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

    function getAccount(homeAccountId) {
        return client.getAccount({ homeAccountId });
    }

    function getAccountInfo(account) {
        return {
            account: account,
            accountId: account.homeAccountId,
            username: account.username,
            name: account.name,
            email: account.idTokenClaims.email || account.username
        };
    }

    function refresh(account, context) {
        return client.acquireTokenSilent({
            redirectUri: context.redirectUri,
            account: account,
            scopes: scopes
        });
    }

    function handleResult(result) {
        return extend(getAccountInfo(result.account), {
            accessToken: result.accessToken,
            expiresOn: result.expiresOn
        });
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
            return client.initialize();
        },
        getAllAccounts: function () {
            var accounts = client.getAllAccounts();
            return map(accounts, function (v) {
                return v.idTokenClaims && getAccountInfo(v);
            });
        },
        getActiveAccount: function (context) {
            var account = client.getActiveAccount();
            return account && refresh(account, context).then(handleResult, function () {
                client.setActiveAccount(null);
            });
        },
        setActiveAccount: function (cached) {
            client.setActiveAccount(cached && cached.account);
        },
        handleLoginRedirect: function () {
            return client.handleRedirectPromise().then(handleResult);
        },
        refresh: function (params, context) {
            var account = getAccount(params.accountId);
            if (!account) {
                return reject(errorWithCode(AuthError.userNotLoggedIn));
            }
            return refresh(account, context).then(handleResult, function (e) {
                throw e instanceof InteractionRequiredAuthError ? errorWithCode(AuthError.userNotLoggedIn) : e;
            });
        },
        login: function (params, context) {
            var request = {
                redirectUri: context.redirectUri,
                loginHint: params.loginHint,
                account: params.accountId && getAccount(params.accountId),
                scopes: scopes
            };
            if (client.getActiveAccount()) {
                request.prompt = 'select_account';
            }
            clearInteractionStatus();
            if (params.interaction === 'popup') {
                return client.loginPopup(request).then(handleResult);
            } else {
                return client.loginRedirect(request);
            }
        },
        logout: function (params, context) {
            var account = getAccount(params.accountId);
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
        client.getConfiguration().auth.navigateToLoginRequestUrl = false;
        return createProvider(key, client, options);
    }
});

export default MsalAuthProvider;
