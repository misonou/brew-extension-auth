import { mockFn } from "@misonou/test-utils";
import { jest } from "@jest/globals";

export const providerResult = {
    account: {},
    accountId: 'id',
    get accessToken() {
        return '__access_token__';
    }
};
export const getAccessToken = jest.spyOn(providerResult, 'accessToken', 'get');

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
        init: mockFn(async () => null),
        login: mockFn(async () => ({ ...providerResult, expiresOn: jest.now() + 1000 })),
        logout: mockFn(async () => { }),
        refresh: mockFn(async () => ({ ...providerResult, expiresOn: jest.now() + 1000 })),
        isHandleable: mockFn(() => isHandleable)
    };
}
