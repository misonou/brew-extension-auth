import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import AuthProvider from "src/provider";
import { mockFn, verifyCalls } from "@misonou/test-utils";
import { createAuthResult, providerResult } from "./harness/providers";

const authClient = {
    authType: 'password',
    providerType: 'test',
    handleLoginRedirect: mockFn(async () => createAuthResult('id')),
    login: mockFn(async ({ loginHint } = {}) => createAuthResult(loginHint || 'id')),
    logout: mockFn(async () => { }),
    refresh: mockFn(async ({ accountId }) => createAuthResult(accountId)),
    isHandleable: mockFn(() => true)
};

describe('AuthProvider', () => {
    it('should login from designated provider after redirection', async () => {
        const contextArg = expect.objectContaining({
            redirectUri: expect.any(String)
        });

        const app = brew.with(Router, Auth)(app => {
            app.useRouter({
                routes: ['/*']
            });
            app.cache.set('brew.auth', { provider: 'default', returnPath: '/bar' });
            app.useAuth({
                provider: AuthProvider.from('default', authClient)
            });
        });
        await app.ready;

        verifyCalls(authClient.handleLoginRedirect, [[contextArg]]);
        expect(app.user).toBeTruthy();
        await expect(app.acquireToken()).resolves.toBe(providerResult.accessToken);
    });
});
