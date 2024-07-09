import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import { createProvider } from "./harness/providers";
import { _, mockFn, verifyCalls } from "@misonou/test-utils";

describe('Auth extension', () => {
    it('should invoke login event on start with sessionResumed flag set to true when the same user is logged in', async () => {
        const provider1 = createProvider('provider1', 'password', 'test', true);
        const provider2 = createProvider('provider2', 'password', 'test', true);

        provider1.getActiveAccount.mockResolvedValueOnce({
            account: { id: 'id1' },
            accountId: 'id1',
            accessToken: '__access_token__',
            expiresOn: Date.now() + 1000
        });
        provider2.getActiveAccount.mockResolvedValueOnce({
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
            app.cache.set('brew.auth', { provider: 'provider2', accountId: 'id2' });
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
            [expect.objectContaining({ sessionResumed: true, sessionChanged: false }), _]
        ]);
    });
});
