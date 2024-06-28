import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import * as ErrorCode from "src/errorCode";
import { _, cleanup, mockFn, verifyCalls, cloneMockResult } from "@misonou/test-utils";
import { waitFor } from "@testing-library/dom";
import { catchAsync } from "zeta-dom/util";
import dom from "zeta-dom/dom";
import { jest } from "@jest/globals";
import { createProvider, getAccessToken, providerResult } from "./harness/providers";

function normalizeURL(url) {
    return new URL(url, location.origin).toString();
}

/** @type Brew.AppInstance<import("src").AuthContext<any> & Brew.WithRouter> */
let app;

const authProvider = createProvider('default', 'password', 'test', true);
const providers = [
    authProvider,
    createProvider('provider2', 'publicKey', 'dummy', false),
    createProvider('provider3', 'publicKey', 'dummy', false),
];
const resolveUser = mockFn(v => v.account);
const loginParams = { provider: 'default' };

let initCall;
let initUser;
let initError;

beforeAll(async () => {
    const onerror = mockFn();
    dom.on('error', onerror);
    providers[2].init.mockRejectedValue(new Error());

    app = brew.with(Router, Auth)(app => {
        app.useRouter({
            baseUrl: '/base',
            initialPath: '/foo',
            routes: ['/*']
        });
        app.useAuth({
            providers,
            resolveUser
        });
    });
    await app.ready;
    providers.forEach(v => {
        v.context = v.init.mock.calls[0][0];
    });
    initCall = cloneMockResult(authProvider.init);
    initError = cloneMockResult(onerror);
    initUser = app.user;
});

beforeEach(async () => {
    await app.logout();
});

describe('Auth extension', () => {
    it('should initialize provider with context', () => {
        expect(initCall).toHaveBeenCalledTimes(1);

        const context = initCall.mock.calls[0][0];
        expect(normalizeURL(context.redirectUri)).toBe(normalizeURL('/base'));
        expect(context.revokeSession).toBeInstanceOf(Function);
    });

    it('should catch init error', () => {
        expect(initError).toHaveBeenCalledTimes(1);
    });

    it('should be not logged in by default', () => {
        expect(initUser).toBeNull();
    });
});

describe('app.resolveAuthProvider', () => {
    it('should resolve to matched provider', async () => {
        const expected = {
            key: 'default',
            authType: 'password',
            providerType: 'test'
        };
        await expect(app.resolveAuthProvider({ loginHint: 'foo' })).resolves.toEqual(expected);
        await expect(app.resolveAuthProvider({ provider: 'default' })).resolves.toEqual(expected);
        await expect(app.resolveAuthProvider({ authType: 'password' })).resolves.toEqual(expected);
        await expect(app.resolveAuthProvider({ providerType: 'test' })).resolves.toEqual(expected);
    });

    it('should resolve to null if no provider satifies login hints', async () => {
        authProvider.isHandleable.mockReturnValueOnce(false);
        await expect(app.resolveAuthProvider({ loginHint: 'foo' })).resolves.toBeNull();
        await expect(app.resolveAuthProvider({ provider: 'foo' })).resolves.toBeNull();
        await expect(app.resolveAuthProvider({ authType: 'federated' })).resolves.toBeNull();
        await expect(app.resolveAuthProvider({ providerType: 'foo' })).resolves.toBeNull();

        await expect(app.resolveAuthProvider({ authType: 'password', providerType: 'foo', loginHint: 'foo' })).resolves.toBeNull();
        await expect(app.resolveAuthProvider({ authType: 'federated', providerType: 'test', loginHint: 'foo' })).resolves.toBeNull();
    });

    it('should resolve to null if there is multiple providers', async () => {
        await expect(app.resolveAuthProvider({})).resolves.toBeNull();
    });

    it('should resolve to null if multiple providers have the same provider type', async () => {
        await expect(app.resolveAuthProvider({ providerType: 'dummy' })).resolves.toBeNull();
    });
});

describe('app.login', () => {
    it('should emit login event', async () => {
        const cb = mockFn();
        cleanup(app.on('login', cb));

        await app.login(loginParams);
        expect(app.user).toBe(providerResult.account);
        verifyCalls(cb, [
            [expect.objectContaining({ type: 'login', user: providerResult.account }), _]
        ]);
    });

    it('should call provider\'s isHandleable method if login hint is supplied', async () => {
        catchAsync(app.login({ loginHint: 'foo' }));
        await waitFor(() => expect(authProvider.isHandleable).toHaveBeenCalled());
        verifyCalls(authProvider.isHandleable, [['foo']]);
    });

    it('should call provider\'s login method with login hint and passowrd if supplied', async () => {
        await app.login({ loginHint: 'foo', password: 'bar' });
        verifyCalls(authProvider.login, [
            [expect.objectContaining({ loginHint: 'foo', password: 'bar' }), authProvider.context]
        ]);
    });

    it('should throw error if no provider satifies login hints', async () => {
        authProvider.isHandleable.mockReturnValueOnce(false);
        await expect(app.login({ loginHint: 'foo' })).rejects.toBeErrorWithCode(ErrorCode.noProvider);
        await expect(app.login({ provider: 'foo' })).rejects.toBeErrorWithCode(ErrorCode.noProvider);
        await expect(app.login({ authType: 'federated' })).rejects.toBeErrorWithCode(ErrorCode.noProvider);
        await expect(app.login({ providerType: 'foo' })).rejects.toBeErrorWithCode(ErrorCode.noProvider);
    });

    it('should throw error if user is already logged in', async () => {
        await app.login(loginParams);
        await expect(app.login()).rejects.toBeErrorWithCode(ErrorCode.loggedIn);
    });

    it('should throw error if provider throws', async () => {
        const error = new Error();
        authProvider.login.mockRejectedValueOnce(error);

        await expect(app.login(loginParams)).rejects.toBe(error);
        expect(app.user).toBeNull();
    });

    it('should logout user if resolveUser callback throws', async () => {
        const error = new Error();
        resolveUser.mockRejectedValueOnce(error);

        const cb = mockFn();
        cleanup(app.on('login', cb));

        await expect(app.login(loginParams)).rejects.toBe(error);
        expect(app.user).toBeNull();
        expect(cb).not.toHaveBeenCalled();
    });

    it('should persist returning info in session storage', async () => {
        let cachedData;
        authProvider.login.mockImplementationOnce(async () => {
            cachedData = app.cache.get('brew.auth');
            return authProvider.login.getMockImplementation()();
        });

        await app.login(loginParams);
        expect(cachedData).toEqual({
            provider: 'default',
            returnPath: app.path
        });
        expect(app.cache.get('brew.auth')).toBeUndefined();
    });

    it('should delete returning info after login failed', async () => {
        let cachedData;
        authProvider.login.mockImplementationOnce(async () => {
            cachedData = app.cache.get('brew.auth');
            throw new Error();
        });

        await expect(app.login(loginParams)).rejects.toBeInstanceOf(Error);
        expect(cachedData).toEqual({
            provider: 'default',
            returnPath: app.path
        });
        expect(app.cache.get('brew.auth')).toBeUndefined();
    });
});

describe('app.logout', () => {
    it('should emit logout event', async () => {
        await app.login(loginParams);
        expect(app.user).toBeTruthy();

        const cb = mockFn();
        cleanup(app.on('logout', cb));

        await app.logout();
        expect(app.user).toBeNull();
        verifyCalls(cb, [
            [expect.objectContaining({ type: 'logout', user: providerResult.account }), _]
        ]);
    });

    it('should invoke provider\'s logout method', async () => {
        await app.login(loginParams);
        expect(app.user).toBeTruthy();

        await app.logout();
        verifyCalls(authProvider.logout, [
            [expect.objectContaining({ accountId: providerResult.accountId, singleLogout: undefined }), authProvider.context]
        ]);
    });

    it('should throw error if provider throws', async () => {
        const error = new Error();
        authProvider.logout.mockRejectedValueOnce(error);

        await app.login(loginParams);
        await expect(app.logout()).rejects.toBe(error);
        expect(app.user).toBeTruthy();
    });

    it('should persist returning info in session storage', async () => {
        let cachedData;
        authProvider.logout.mockImplementationOnce(async () => {
            cachedData = app.cache.get('brew.auth');
            return authProvider.logout.getMockImplementation()();
        });

        await app.login(loginParams);
        await app.logout();
        expect(cachedData).toEqual({
            provider: '',
            returnPath: app.path
        });
        expect(app.cache.get('brew.auth')).toBeUndefined();
    });
});

describe('app.acquireToken', () => {
    it('should return null and an unretryable flag if user is not logged in', async () => {
        await expect(app.acquireToken()).resolves.toBeNull();

        const cb = mockFn();
        await app.acquireToken(cb);
        verifyCalls(cb, [[null, false]]);
    });

    it('should return last access token and a retryable flag if it is not expired', async () => {
        await app.login(loginParams);
        await expect(app.acquireToken()).resolves.toBe(providerResult.accessToken);

        const cb = mockFn();
        await app.acquireToken(cb);
        verifyCalls(cb, [[providerResult.accessToken, true]]);
    });

    it('should return refreshed access token and an unretryable flag if it has expired', async () => {
        jest.useFakeTimers();
        await app.login(loginParams);
        await expect(app.acquireToken()).resolves.toBe(providerResult.accessToken);

        const newAccessToken = '__new_access_token__';
        getAccessToken.mockReturnValueOnce(newAccessToken);
        jest.advanceTimersByTime(2000);

        const cb = mockFn();
        await app.acquireToken(cb);
        verifyCalls(cb, [[newAccessToken, false]]);
        verifyCalls(authProvider.refresh, [
            [expect.objectContaining(providerResult), authProvider.context]
        ]);

        await expect(app.acquireToken()).resolves.toBe(newAccessToken);
    });

    it('should return current access token and an unretryable flag if it has expired and provider has failed to refresh', async () => {
        jest.useFakeTimers();
        await app.login(loginParams);
        await expect(app.acquireToken()).resolves.toBe(providerResult.accessToken);

        authProvider.refresh.mockRejectedValueOnce(new Error());
        jest.advanceTimersByTime(2000);

        const cb = mockFn();
        await app.acquireToken(cb);
        verifyCalls(cb, [[providerResult.accessToken, false]]);
        expect(authProvider.refresh).toHaveBeenCalled();
    });

    it('should return new access token if force parameter is true', async () => {
        await app.login(loginParams);
        await expect(app.acquireToken()).resolves.toBe(providerResult.accessToken);

        const newAccessToken = '__new_access_token__';
        getAccessToken.mockReturnValueOnce(newAccessToken);
        await expect(app.acquireToken(true)).resolves.toBe(newAccessToken);
        expect(authProvider.refresh).toHaveBeenCalled();
    });

    it('should throw error if force parameter is true and provider has failed to refresh', async () => {
        await app.login(loginParams);
        await expect(app.acquireToken()).resolves.toBe(providerResult.accessToken);

        const error = new Error();
        authProvider.refresh.mockRejectedValueOnce(error);
        await expect(app.acquireToken(true)).rejects.toBe(error);
    });
});

describe('AuthProviderContext.revokeSession', () => {
    it('should emit sessionEnded event', async () => {
        await app.login(loginParams);

        const cb = mockFn();
        cleanup(app.on('sessionEnded', cb));

        authProvider.context.revokeSession();
        expect(cb).toHaveBeenCalledTimes(1);
        expect(app.user).toBeNull();
    });

    it('should emit sessionEnded event when given current account ID', async () => {
        await app.login(loginParams);

        const cb = mockFn();
        cleanup(app.on('sessionEnded', cb));

        authProvider.context.revokeSession(providerResult.accountId);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(app.user).toBeNull();
    });

    it('should not emit sessionEnded event when account ID does not match the current one', async () => {
        await app.login(loginParams);

        const cb = mockFn();
        cleanup(app.on('sessionEnded', cb));

        authProvider.context.revokeSession(providerResult.accountId + '__');
        expect(cb).not.toHaveBeenCalled();
        expect(app.user).toBeTruthy();
    });

    it('should not emit sessionEnded event when user is not logged in with the provider', async () => {
        await app.login(loginParams);

        const cb = mockFn();
        cleanup(app.on('sessionEnded', cb));

        providers[1].context.revokeSession();
        expect(cb).not.toHaveBeenCalled();
        expect(app.user).toBeTruthy();
    });

    it('should not log out user if sessionEnded event is handled', async () => {
        await app.login(loginParams);

        cleanup(app.on('sessionEnded', () => true));
        authProvider.context.revokeSession();
        expect(app.user).toBeTruthy();
    });
});
