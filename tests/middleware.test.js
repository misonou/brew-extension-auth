import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "src/extension";
import { createAxiosMiddleware, createFetchMiddleware } from "src/middleware";
import { createAxios, createFakeResponse, onAxiosRequest } from "./harness/axios";
import { createProvider, getAccessToken, providerResult } from "./harness/providers";
import { jest } from "@jest/globals";
import { mockFn } from "@misonou/test-utils";
import { AxiosError } from "axios";

/** @type Brew.AppInstance<import("src").AuthContext<any>> */
let app;

const fetch = jest.spyOn(window, 'fetch').mockImplementation(async () => new Response('body'));
const provider = createProvider('default', 'password', 'test', true);

beforeAll(async () => {
    app = brew.with(Router, Auth)(app => {
        app.useRouter({
            routes: ['/*']
        });
        app.useAuth({
            provider
        });
    });
    await app.ready;
});

beforeEach(async () => {
    await app.logout();
});

describe('createFetchMiddleware', () => {
    it('should set authorization header when user is logged in', async () => {
        await app.login();

        const mw = createFetchMiddleware(app);
        await mw('http://test.com');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0].headers.get('authorization')).toBe(`Bearer ${providerResult.accessToken}`);
    });

    it('should not set authorization header when user is not logged in', async () => {
        const mw = createFetchMiddleware(app);
        await mw('http://test.com');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0].headers.has('authorization')).toBe(false);
    });

    it('should acquire new access token and retry if response status is 401', async () => {
        await app.login();

        const newAccessToken = '__new_access_token__';
        fetch.mockResolvedValueOnce(new Response('body', { status: 401 }));
        getAccessToken.mockReturnValueOnce(newAccessToken);

        const mw = createFetchMiddleware(app);
        await mw('http://test.com');

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch.mock.calls[0][0].headers.get('authorization')).toBe(`Bearer ${providerResult.accessToken}`);
        expect(fetch.mock.calls[1][0].headers.get('authorization')).toBe(`Bearer ${newAccessToken}`);
    });

    it('should not retry if access token has already been refreshed', async () => {
        jest.useFakeTimers();
        await app.login();

        const newAccessToken = '__new_access_token__';
        getAccessToken.mockReturnValueOnce(newAccessToken);
        jest.advanceTimersByTime(2000);

        const mw = createFetchMiddleware(app);
        await mw('http://test.com');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0].headers.get('authorization')).toBe(`Bearer ${newAccessToken}`);
    });

    it('should not retry again if it fails to refresh access token', async () => {
        await app.login();

        fetch.mockResolvedValueOnce(new Response('body', { status: 401 }));
        provider.refresh.mockRejectedValueOnce(new Error());

        const mw = createFetchMiddleware(app);
        await expect(mw('http://test.com')).resolves.toEqual(expect.objectContaining({ status: 401, ok: false }));

        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should not retry again if response status is still 401', async () => {
        await app.login();

        const newAccessToken = '__new_access_token__';
        fetch.mockResolvedValueOnce(new Response('body', { status: 401 }));
        fetch.mockResolvedValueOnce(new Response('body', { status: 401 }));
        getAccessToken.mockReturnValueOnce(newAccessToken);

        const mw = createFetchMiddleware(app);
        await expect(mw('http://test.com')).resolves.toEqual(expect.objectContaining({ status: 401, ok: false }));

        expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should not overwrite authorization header if it already exists', async () => {
        const mw = createFetchMiddleware(app);
        await mw('http://test.com', {
            headers: {
                authorization: '__custom_value__'
            }
        });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0].headers.get('authorization')).toBe('__custom_value__');
    });

    it('should accept next middleware', async () => {
        await app.login();

        const next = mockFn(req => fetch(req));
        const mw = createFetchMiddleware(app);
        await mw(new Request('http://test.com'), next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0].headers.get('authorization')).toBe(`Bearer ${providerResult.accessToken}`);
    });

    it('should accept filter to opt-out authorization header', async () => {
        await app.login();

        const filter = mockFn(() => true);
        const mw = createFetchMiddleware(app, filter);
        await mw('http://test.com');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0].headers.get('authorization')).toBe(`Bearer ${providerResult.accessToken}`);
        expect(filter).toHaveBeenCalledTimes(1);
        expect(filter.mock.calls[0][0]).toBeInstanceOf(Request);
        fetch.mockClear();

        filter.mockReturnValueOnce(false);
        await mw('http://test.com');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0].headers.has('authorization')).toBe(false);
    });

    it('should invoke filter once per request despite retry', async () => {
        await app.login();

        const newAccessToken = '__new_access_token__';
        fetch.mockResolvedValueOnce(new Response('body', { status: 401 }));
        getAccessToken.mockReturnValueOnce(newAccessToken);

        const filter = mockFn(() => true);
        const mw = createFetchMiddleware(app, filter);
        await mw('http://test.com');

        expect(fetch).toHaveBeenCalledTimes(2);
        expect(filter).toHaveBeenCalledTimes(1);
    });
});

describe('createAxiosMiddleware', () => {
    it('should set authorization header when user is logged in', async () => {
        await app.login();

        const axios = createAxios();
        createAxiosMiddleware(app)(axios);
        await axios('http://test.com');

        expect(onAxiosRequest).toHaveBeenCalledTimes(1);
        expect(onAxiosRequest.mock.calls[0][0].headers?.authorization).toBe(`Bearer ${providerResult.accessToken}`);
    });

    it('should not set authorization header when user is not logged in', async () => {
        const axios = createAxios();
        createAxiosMiddleware(app)(axios);
        await axios('http://test.com');

        expect(onAxiosRequest).toHaveBeenCalledTimes(1);
        expect(onAxiosRequest.mock.calls[0][0].headers?.authorization).toBeUndefined();
    });

    it('should acquire new access token and retry if response status is 401', async () => {
        await app.login();

        const newAccessToken = '__new_access_token__';
        onAxiosRequest.mockImplementationOnce(createFakeResponse(401));
        getAccessToken.mockReturnValueOnce(newAccessToken);

        const axios = createAxios();
        createAxiosMiddleware(app)(axios);
        await axios('http://test.com');

        expect(onAxiosRequest).toHaveBeenCalledTimes(2);
        expect(onAxiosRequest.mock.calls[1][0].headers?.authorization).toBe(`Bearer ${newAccessToken}`);
    });

    it('should not retry if access token has already been refreshed', async () => {
        jest.useFakeTimers();
        await app.login();

        const newAccessToken = '__new_access_token__';
        getAccessToken.mockReturnValueOnce(newAccessToken);
        jest.advanceTimersByTime(2000);

        const axios = createAxios();
        createAxiosMiddleware(app)(axios);
        await axios('http://test.com');

        expect(onAxiosRequest).toHaveBeenCalledTimes(1);
        expect(onAxiosRequest.mock.calls[0][0].headers?.authorization).toBe(`Bearer ${newAccessToken}`);
    });

    it('should not retry again if it fails to refresh access token', async () => {
        await app.login();

        onAxiosRequest.mockImplementationOnce(createFakeResponse(401));
        provider.refresh.mockRejectedValueOnce(new Error());

        const axios = createAxios();
        createAxiosMiddleware(app)(axios);
        await expect(axios('http://test.com')).rejects.toBeInstanceOf(AxiosError);

        expect(onAxiosRequest).toHaveBeenCalledTimes(1);
    });

    it('should not retry again if response status is still 401', async () => {
        await app.login();

        const newAccessToken = '__new_access_token__';
        onAxiosRequest.mockImplementationOnce(createFakeResponse(401));
        onAxiosRequest.mockImplementationOnce(createFakeResponse(401));
        getAccessToken.mockReturnValueOnce(newAccessToken);

        const axios = createAxios();
        createAxiosMiddleware(app)(axios);
        await expect(axios('http://test.com')).rejects.toBeInstanceOf(AxiosError);

        expect(onAxiosRequest).toHaveBeenCalledTimes(2);
    });

    it('should not overwrite authorization header if it already exists', async () => {
        const axios = createAxios();
        createAxiosMiddleware(app)(axios);
        await axios('http://test.com', {
            headers: {
                authorization: '__custom_value__'
            }
        });

        expect(onAxiosRequest).toHaveBeenCalledTimes(1);
        expect(onAxiosRequest.mock.calls[0][0].headers?.authorization).toBe('__custom_value__');
    });

    it('should accept filter to opt-out authorization header', async () => {
        await app.login();

        const filter = mockFn(() => true);
        const axios = createAxios();
        createAxiosMiddleware(app, filter)(axios);
        await axios('http://test.com');

        expect(onAxiosRequest).toHaveBeenCalledTimes(1);
        expect(onAxiosRequest.mock.calls[0][0].headers?.authorization).toBe(`Bearer ${providerResult.accessToken}`);
        expect(filter).toHaveBeenCalledTimes(1);
        expect(filter.mock.calls[0][0]).toMatchObject({ url: 'http://test.com' });
        onAxiosRequest.mockClear();

        filter.mockReturnValueOnce(false);
        await axios('http://test.com');

        expect(onAxiosRequest).toHaveBeenCalledTimes(1);
        expect(onAxiosRequest.mock.calls[0][0].headers?.authorization).toBeUndefined();
    });

    it('should invoke filter once per request despite retry', async () => {
        await app.login();

        const newAccessToken = '__new_access_token__';
        onAxiosRequest.mockImplementationOnce(createFakeResponse(401));
        getAccessToken.mockReturnValueOnce(newAccessToken);

        const filter = mockFn(() => true);
        const axios = createAxios();
        createAxiosMiddleware(app, filter)(axios);
        await axios('http://test.com');

        expect(onAxiosRequest).toHaveBeenCalledTimes(2);
        expect(filter).toHaveBeenCalledTimes(1);
    });
});
