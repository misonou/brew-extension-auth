import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import AuthProvider from "src/provider";
import { cleanup, cloneMockResult, mockFn, verifyCalls } from "@misonou/test-utils";
import { accounts, createAuthResult, providerResult } from "./harness/providers";
import { jest } from "@jest/globals";
import * as AuthError from "src/errorCode";

/** @type Brew.AppInstance<import("src").AuthContext<any>> */
let app;
let initCalls;

const authClient = {
    authType: 'password',
    providerType: 'test',
    init: mockFn(async () => { }),
    login: mockFn(async ({ loginHint } = {}) => createAuthResult(loginHint || 'id')),
    logout: mockFn(async () => { }),
    refresh: mockFn(async ({ accountId }) => createAuthResult(accountId)),
    getAccountInfo: mockFn(({ id }) => ({ username: id })),
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

beforeEach(async () => {
    await app.logout();
});

describe('AuthProvider', () => {
    it('should forward calls to client', async () => {
        const contextArg = expect.objectContaining({
            redirectUri: expect.any(String)
        });
        verifyCalls(initCalls, [[contextArg]]);

        let last;
        jest.useFakeTimers();
        await app.login({ loginHint: 'foo', password: 'bar' });
        verifyCalls(authClient.login, [
            [expect.objectContaining({ loginHint: 'foo', password: 'bar' }), contextArg]
        ]);
        last = await authClient.login.mock.results[0].value;

        jest.advanceTimersByTime(2000);
        await app.acquireToken();
        verifyCalls(authClient.refresh, [
            [expect.objectContaining({ expiresOn: last.expiresOn }), contextArg]
        ]);
        last = await authClient.refresh.mock.results[0].value;
        authClient.refresh.mockClear();

        jest.advanceTimersByTime(2000);
        await app.acquireToken();
        verifyCalls(authClient.refresh, [
            [expect.objectContaining({ expiresOn: last.expiresOn }), contextArg]
        ]);
        last = await authClient.refresh.mock.results[0].value;

        await app.logout();
        verifyCalls(authClient.logout, [
            [expect.objectContaining({ expiresOn: last.expiresOn }), contextArg]
        ]);
    });

    it('should cache session', async () => {
        const expectedResult1 = {
            accountId: 'id1',
            accessToken: providerResult.accessToken,
            expiresOn: expect.any(Number)
        };
        const expectedResult2 = {
            accountId: 'id2',
            accessToken: providerResult.accessToken,
            expiresOn: expect.any(Number)
        };

        await app.login({ loginHint: 'id1' });
        expect(JSON.parse(localStorage.getItem('brew.auth.default'))).toEqual([expectedResult1]);
        expect(localStorage.getItem('brew.auth.default.id')).toBe('id1');

        await app.login({ loginHint: 'id2' });

        const cached2 = JSON.parse(localStorage.getItem('brew.auth.default'));
        expect(cached2).toHaveLength(2);
        expect(cached2).toContainEqual(expectedResult1);
        expect(cached2).toContainEqual(expectedResult2);
        expect(localStorage.getItem('brew.auth.default.id')).toBe('id2');

        const allAccounts = await app.getAllAccounts();
        expect(allAccounts).toHaveLength(2);
        expect(allAccounts).toContainEqual(expect.objectContaining({ username: 'id1', accountId: 'id1', account: accounts.id1, provider: 'default' }));
        expect(allAccounts).toContainEqual(expect.objectContaining({ username: 'id2', accountId: 'id2', account: accounts.id2, provider: 'default' }));

        await app.logout();
        expect(JSON.parse(localStorage.getItem('brew.auth.default'))).toEqual([expectedResult1]);
        expect(localStorage.getItem('brew.auth.default.id')).toBeNull();
    });

    it('should revoke session if user has logged out in other tab', async () => {
        await app.login();

        const cb = mockFn();
        cleanup(app.on('sessionEnded', cb));

        const oldValue = localStorage.getItem('brew.auth.default');
        localStorage.setItem('brew.auth.default', '[]');
        window.dispatchEvent(new StorageEvent('storage', {
            storageArea: localStorage,
            key: 'brew.auth.default',
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
        expect(cb).toHaveBeenCalledTimes(0);
    });

    it('should throw when refreshing token for user whose cached session is removed', async () => {
        await app.login({ loginHint: 'id1' });
        await app.login({ loginHint: 'id2' });
        localStorage.setItem('brew.auth.default', '[]');
        await expect(app.acquireToken({ provider: 'default', accountId: 'id1' })).rejects.toBeErrorWithCode(AuthError.userNotLoggedIn);
    });

    it('should not throw when cached data is corrupted', async () => {
        localStorage.setItem('brew.auth.default', 'corrupted');
        await expect(app.getAllAccounts()).resolves.toEqual([]);
    });
});
