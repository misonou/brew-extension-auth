import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import AuthProvider from "src/provider";
import { mockFn, verifyCalls } from "@misonou/test-utils";
import { providerResult } from "./harness/providers";
import { jest } from "@jest/globals";

const authClient = {
    authType: 'password',
    providerType: 'test',
    login: mockFn(async () => ({ ...providerResult, expiresOn: jest.now() + 1000 })),
    logout: mockFn(async () => { }),
    refresh: mockFn(async () => ({ ...providerResult, expiresOn: jest.now() + 1000 })),
    isHandleable: mockFn(() => true)
};

const cachedData = {
    accountId: 'id',
    accessToken: '__old_access_token__',
    expiresOn: jest.now() + 100000
};

beforeAll(async () => {
    localStorage.setItem('brew.auth.default.id', 'id');
    localStorage.setItem('brew.auth.default', JSON.stringify(cachedData));
});

describe('AuthProvider', () => {
    it('should resume from previous session', async () => {
        const app = brew.with(Router, Auth)(app => {
            app.useRouter({
                routes: ['/*']
            });
            app.useAuth({
                provider: AuthProvider.from('default', authClient)
            });
        });
        await app.ready;

        verifyCalls(authClient.refresh, [[cachedData]]);
        expect(app.user).toBeTruthy();
        await expect(app.acquireToken()).resolves.toBe(providerResult.accessToken);
    });
});
