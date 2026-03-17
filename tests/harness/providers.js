import { mockFn } from "@misonou/test-utils";
import { jest } from "@jest/globals";

export const accounts = new Proxy(Object.create(null), {
    get(target, prop) {
        return target[prop] || (target[prop] = { id: prop });
    }
});
export const providerResult = {
    get accessToken() {
        return '__access_token__';
    }
};
export const getAccessToken = jest.spyOn(providerResult, 'accessToken', 'get');

export function createAuthResult(accountId) {
    return {
        ...providerResult,
        account: accounts[accountId],
        accountId,
        expiresOn: jest.now() + 1000
    };
}

/**
 * @param {string} key
 * @param {import("src").AuthType} authType
 * @param {string} providerType
 * @returns {import("src/extension").AuthProvider<string>}
 */
export function createProvider(key, authType, providerType, isHandleable) {
    return {
        key,
        authType,
        providerType,
        init: mockFn(async () => { }),
        getActiveAccount: mockFn(async () => null),
        handleLoginRedirect: mockFn(async () => null),
        login: mockFn(async ({ loginHint } = {}) => createAuthResult(loginHint || 'id')),
        logout: mockFn(async () => { }),
        refresh: mockFn(async ({ accountId }) => createAuthResult(accountId)),
        isHandleable: mockFn(() => isHandleable)
    };
}
