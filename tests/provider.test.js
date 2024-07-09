import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import AuthProvider from "src/provider";
import { cleanup, cloneMockResult, mockFn, verifyCalls } from "@misonou/test-utils";
import { providerResult } from "./harness/providers";
import { jest } from "@jest/globals";

/** @type Brew.AppInstance<import("src").AuthContext<any>> */
let app;
let initCalls;

const authClient = {
    authType: 'password',
    providerType: 'test',
    init: mockFn(async () => { }),
    login: mockFn(async () => ({ ...providerResult, expiresOn: jest.now() + 1000 })),
    logout: mockFn(async () => { }),
    refresh: mockFn(async () => ({ ...providerResult, expiresOn: jest.now() + 1000 })),
    isHandleable: mockFn(() => true)
};

beforeAll(async () => {
    app = brew.with(Router, Auth)(app => {
        app.useRouter({
            routes: ['/*']
        });
        app.useAuth({
            provider: AuthProvider.from('default', authClient)
        });
    });
    await app.ready;
    initCalls = cloneMockResult(authClient.init);
});

describe('AuthProvider', () => {
    it('should forward calls to client', async () => {
        const contextArg = expect.objectContaining({
            redirectUri: expect.any(String)
        });
        verifyCalls(initCalls, [[contextArg]]);

        jest.useFakeTimers();
        await app.login({ loginHint: 'foo', password: 'bar' });
        verifyCalls(authClient.login, [
            [expect.objectContaining({ loginHint: 'foo', password: 'bar' }), contextArg]
        ]);

        jest.advanceTimersByTime(2000);
        await app.acquireToken();
        verifyCalls(authClient.refresh, [
            [expect.objectContaining(providerResult), contextArg]
        ]);

        await app.logout();
        verifyCalls(authClient.logout, [
            [expect.objectContaining({ accountId: providerResult.accountId, singleLogout: undefined }), contextArg]
        ]);
    });

    it('should cache session', async () => {
        await app.login();
        expect(JSON.parse(localStorage.getItem('brew.auth.default'))).toEqual({
            accountId: providerResult.accountId,
            accessToken: providerResult.accessToken,
            expiresOn: expect.any(Number)
        });
        expect(localStorage.getItem('brew.auth.default.id')).toBe('id');

        await app.logout();
        expect(localStorage.getItem('brew.auth.default')).toBeNull();
        expect(localStorage.getItem('brew.auth.default.id')).toBeNull();
    });

    it('should revoke session if user has logged out in other tab', async () => {
        await app.login();

        const cb = mockFn();
        cleanup(app.on('sessionEnded', cb));

        const oldValue = localStorage.getItem('brew.auth.default.id');
        localStorage.removeItem('brew.auth.default.id');
        window.dispatchEvent(new StorageEvent('storage', {
            storageArea: localStorage,
            key: 'brew.auth.default.id',
            oldValue: oldValue
        }));
        expect(cb).toHaveBeenCalledTimes(1);
        cb.mockClear();

        await app.login();
        localStorage.clear();
        window.dispatchEvent(new StorageEvent('storage', {
            storageArea: localStorage,
            key: null,
            oldValue: null
        }));
        expect(cb).toHaveBeenCalledTimes(1);
    });
});
