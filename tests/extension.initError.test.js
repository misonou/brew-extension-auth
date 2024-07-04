import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import { createProvider } from "./harness/providers";
import { _, delay, mockFn, verifyCalls } from "@misonou/test-utils";
import dom from "zeta-dom/dom";

describe('Auth extension', () => {
    it('should not cause app to halt when resolveUser failed on start', async () => {
        const error = new Error();
        const resolveUser = mockFn(() => { throw error; });
        const onerror = mockFn();
        dom.on('error', onerror);

        const provider = createProvider('provider1', 'password', 'test', true);
        provider.init.mockResolvedValueOnce({
            account: { id: 'id1' },
            accountId: 'id1',
            accessToken: '__access_token__',
            expiresOn: Date.now() + 1000
        });

        const app = brew.with(Router, Auth)(app => {
            app.useRouter({
                baseUrl: '/base',
                initialPath: '/foo',
                routes: ['/*']
            });
            app.cache.set('brew.auth', { provider: 'provider1', returnPath: '/bar' });
            app.useAuth({
                providers: [provider],
                resolveUser: resolveUser
            });
        });
        await app.ready;
        expect(app.user).toBeNull();
        expect(resolveUser).toHaveBeenCalled();
        verifyCalls(onerror, [
            [expect.objectContaining({ error }), _]
        ]);

        await delay(100);
        expect(app.path).toBe('/foo');
    });
});
