import brew from "brew-js/app";
import Auth from "src/extension";
import { createAuthResult, createProvider } from "./harness/providers";
import { mockFn } from "@misonou/test-utils";
import { createObjectStorage } from "brew-js/util";
import { waitFor } from "@testing-library/dom";

/** @type Brew.AppInstance<import("src").AuthContext<any>> */
let app;

const authProvider = createProvider('default', 'password', 'test', true);
const resolveUser = mockFn(v => v.account);
const loginParams = { provider: 'default', loginHint: 'id' };

beforeAll(async () => {
    history.replaceState({}, '', '/foo?q=1#hash');
    app = brew.with(Auth)(app => {
        app.useAuth({
            provider: authProvider,
            resolveUser
        });
    });
    authProvider.context = authProvider.init.mock.calls[0][0];
    await app.ready;
});

beforeEach(async () => {
    await app.logout();
    history.replaceState({}, '', '/');
});

describe('Auth extension', () => {
    it('should store current state in session storage', async () => {
        await app.login(loginParams);

        const storage = createObjectStorage(window.sessionStorage, 'brew.auth');
        expect(storage.get('brew.auth')).toEqual({
            accountId: 'id',
            provider: 'default'
        });
    });

    it('should call app.navigate if available', async () => {
        history.replaceState({}, '', '/bar');
        app.navigate = mockFn();

        await app.login(loginParams);
        expect(app.navigate).toHaveBeenCalledWith('/bar');

        await app.login({ ...loginParams, returnPath: '/foo' });
        expect(app.navigate).toHaveBeenCalledWith('/foo');
    });

    it('should ignore return path if app.navigate is not available', async () => {
        app.navigate = null;

        await app.login({ ...loginParams, returnPath: '/foo' });
        expect(window.location.pathname).toBe('/');
    });

    it('should save return path to session storage on login and logout', async () => {
        const { promise, resolve } = Promise.withResolvers();
        authProvider.login.mockReturnValueOnce(promise);

        const loginPromise = app.login(loginParams);
        await waitFor(() => expect(authProvider.login).toHaveBeenCalled());

        let storage = createObjectStorage(window.sessionStorage, 'brew.auth');
        expect(storage.get('brew.auth').returnPath).toBeTruthy();
        resolve(createAuthResult('id'));

        await loginPromise;
        storage = createObjectStorage(window.sessionStorage, 'brew.auth');
        expect(storage.get('brew.auth').returnPath).toBeUndefined();

        app.logout();
        await waitFor(() => expect(authProvider.logout).toHaveBeenCalled());

        storage = createObjectStorage(window.sessionStorage, 'brew.auth');
        expect(storage.get('brew.auth').returnPath).toBeTruthy();
    });
});

describe('AuthProviderContext.redirectUri', () => {
    it('should be the initial URL without query string and hash', async () => {
        expect(authProvider.context.redirectUri).toBe('http://localhost/foo');
    });
});
