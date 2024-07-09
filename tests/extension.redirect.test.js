import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import { createProvider } from "./harness/providers";
import { waitFor } from "@testing-library/dom";
import { _, mockFn, verifyCalls } from "@misonou/test-utils";

describe('Auth extension', () => {
    it('should login from designated provider after redirection', async () => {
        const provider1 = createProvider('provider1', 'password', 'test', true);
        const provider2 = createProvider('provider2', 'password', 'test', true);

        provider1.getActiveAccount.mockResolvedValueOnce({
            account: { id: 'id1' },
            accountId: 'id1',
            accessToken: '__access_token__',
            expiresOn: Date.now() + 1000
        });
        provider2.handleLoginRedirect.mockResolvedValueOnce({
            account: { id: 'id2' },
            accountId: 'id2',
            accessToken: '__access_token__',
            expiresOn: Date.now() + 1000
        });

        const cb = mockFn();
        const app = brew.with(Router, Auth)(app => {
            app.useRouter({
                baseUrl: '/base',
                initialPath: '/foo',
                routes: ['/*']
            });
            app.cache.set('brew.auth', { provider: 'provider2', returnPath: '/bar' });
            app.useAuth({
                providers: [provider1, provider2],
                resolveUser({ account }) {
                    return account;
                }
            });
            app.on('login', cb);
        });
        await app.ready;
        expect(app.user).toEqual({ id: 'id2' });
        verifyCalls(cb, [
            [expect.objectContaining({ sessionResumed: false, sessionChanged: false }), _]
        ]);
        await waitFor(() => expect(app.path).toBe('/bar'));
    });
});
