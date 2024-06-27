import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import { createProvider } from "./harness/providers";
import { _, mockFn, verifyCalls } from "@misonou/test-utils";

describe('Auth extension', () => {
    it('should invoke logout event on start when user is logged out elsewhere', async () => {
        const provider1 = createProvider('provider1', 'password', 'test', true);
        const provider2 = createProvider('provider2', 'password', 'test', true);

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
            app.on('logout', cb);
        });
        await app.ready;
        expect(app.user).toBeNull();
        verifyCalls(cb, [
            [expect.objectContaining({ user: null }), _]
        ]);
    });
});
