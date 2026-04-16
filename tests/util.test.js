import { jest } from "@jest/globals";
import { mockFn } from "@misonou/test-utils";
import { createPasskey, JSONClient, requestPasskey } from "src/util";
import { bufferToStr, decodeBase64url, passkeyMocks } from "./harness/credentials";
import { AuthError } from "src/index";

const fetch = jest.spyOn(window, 'fetch').mockImplementation(async () => new Response('{}'));
const client = new JSONClient('http://test.com');

function verifyRequestObject(request, expected) {
    const { method, url, headers } = request;
    expect({
        method,
        url,
        headers: Object.fromEntries(headers.entries())
    }).toEqual(expect.objectContaining(expected));
}

function getResponseInit(status = 200) {
    return {
        status,
        headers: { 'content-type': 'application/json' }
    };
}

describe('JSONClient', () => {
    it('should set request with base URL and appropriate headers', async () => {
        await client.get('/a');
        verifyRequestObject(fetch.mock.calls[0][0], {
            method: 'GET',
            url: 'http://test.com/a',
            headers: {
                'accept': 'application/json'
            }
        });
        fetch.mockClear();

        await client.post('/a', {});
        verifyRequestObject(fetch.mock.calls[0][0], {
            method: 'POST',
            url: 'http://test.com/a',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
            }
        });
    });

    it('should accept middleware', async () => {
        const cb = mockFn(v => v.data);
        const mw = mockFn((req, next) => next(req).then(cb));
        const client = new JSONClient('http://test.com', mw);

        fetch.mockResolvedValueOnce(new Response('{"data":{"foo":"bar"}}', getResponseInit()));
        await expect(client.get('/a')).resolves.toEqual({ foo: 'bar' });

        expect(mw).toHaveBeenCalledTimes(1);
        verifyRequestObject(mw.mock.calls[0][0], {
            method: 'GET',
            url: 'http://test.com/a'
        });
        expect(mw.mock.calls[0][1]).toBeInstanceOf(Function);

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb.mock.calls[0][0]).toEqual({
            data: { foo: 'bar' }
        });
    });

    it('should throw error if response is not ok', async () => {
        fetch.mockResolvedValueOnce(new Response('{"error":"foo"}', getResponseInit(500)));
        await expect(client.get('/a')).rejects.toBeErrorWithCode('brew/api-error', { status: 500, data: { error: 'foo' } });

        fetch.mockResolvedValueOnce(new Response('xxx', getResponseInit(500)));
        await expect(client.get('/a')).rejects.toBeErrorWithCode('brew/api-error', { status: 500, data: undefined });

        fetch.mockResolvedValueOnce(new Response('{"error":"foo"}', getResponseInit(401)));
        await expect(client.get('/a')).rejects.toBeErrorWithCode('brew/auth-invalid-credential', { status: 401, data: { error: 'foo' } });

        fetch.mockResolvedValueOnce(new Response('xxx', getResponseInit(200)));
        await expect(client.get('/a')).rejects.toBeErrorWithCode('brew/api-error', { status: 200, data: undefined });
    });
});

describe('registerPasskey', () => {
    it('should convert between from base64 to ArrayBuffer', async () => {
        const result = await createPasskey(passkeyMocks.creationOptions);
        expect(navigator.credentials.create).toHaveBeenCalledTimes(1);

        const callArg = navigator.credentials.create.mock.calls[0][0];
        expect(callArg).toHaveProperty('publicKey');
        expect(callArg.publicKey).toEqual({
            ...passkeyMocks.creationOptions,
            challenge: expect.any(ArrayBuffer),
            user: {
                ...passkeyMocks.creationOptions.user,
                id: expect.any(ArrayBuffer),
            },
            excludeCredentials: [
                {
                    ...passkeyMocks.creationOptions.excludeCredentials[0],
                    id: expect.any(ArrayBuffer),
                }
            ]
        });
        expect(bufferToStr(callArg.publicKey.challenge)).toBe(decodeBase64url(passkeyMocks.creationOptions.challenge));
        expect(bufferToStr(callArg.publicKey.user.id)).toBe(decodeBase64url(passkeyMocks.creationOptions.user.id));
        expect(bufferToStr(callArg.publicKey.excludeCredentials[0].id)).toBe(decodeBase64url(passkeyMocks.creationOptions.excludeCredentials[0].id));

        expect(result).toEqual({
            ...passkeyMocks.attestationResponse,
            rawId: expect.any(String),
            response: {
                clientDataJSON: expect.any(String),
                attestationObject: expect.any(String),
                transports: passkeyMocks.attestationResponse.response.getTransports()
            },
            clientExtensionResults: {}
        });
        expect(decodeBase64url(result.rawId)).toBe(bufferToStr(passkeyMocks.attestationResponse.rawId));
        expect(decodeBase64url(result.response.clientDataJSON)).toBe(bufferToStr(passkeyMocks.attestationResponse.response.clientDataJSON));
        expect(decodeBase64url(result.response.attestationObject)).toBe(bufferToStr(passkeyMocks.attestationResponse.response.attestationObject));
    });

    it('should throw when browser does not support publicKey credentials', async () => {
        navigator.credentials.create.mockResolvedValueOnce(null);
        await expect(createPasskey(passkeyMocks.creationOptions)).rejects.toBeInstanceOf(Error);
    });

    it('should throw cancelled error when operation is aborted', async () => {
        const ac = new AbortController();
        navigator.credentials.create.mockImplementationOnce(({ signal }) => {
            expect(signal).toBeInstanceOf(AbortSignal);
            return new Promise((resolve, reject) => {
                signal.addEventListener('abort', () => {
                    reject(signal.reason);
                });
            });
        });
        const error = new Error();
        setTimeout(() => ac.abort(error), 0);
        await expect(createPasskey(passkeyMocks.creationOptions, ac.signal)).rejects.toBe(error);
    });
});

describe('createPasskey', () => {
    it('should convert between from base64 to ArrayBuffer', async () => {
        const result = await requestPasskey(passkeyMocks.requestOptions);
        expect(navigator.credentials.get).toHaveBeenCalledTimes(1);

        const callArg = navigator.credentials.get.mock.calls[0][0];
        expect(callArg).toHaveProperty('publicKey');
        expect(callArg.publicKey).toEqual({
            ...passkeyMocks.requestOptions,
            challenge: expect.any(ArrayBuffer),
            allowCredentials: [
                {
                    ...passkeyMocks.requestOptions.allowCredentials[0],
                    id: expect.any(ArrayBuffer),
                }
            ]
        });
        expect(bufferToStr(callArg.publicKey.challenge)).toBe(decodeBase64url(passkeyMocks.requestOptions.challenge));
        expect(bufferToStr(callArg.publicKey.allowCredentials[0].id)).toBe(decodeBase64url(passkeyMocks.requestOptions.allowCredentials[0].id));

        expect(result).toEqual({
            ...passkeyMocks.assertionResponse,
            rawId: expect.any(String),
            response: {
                clientDataJSON: expect.any(String),
                authenticatorData: expect.any(String),
                signature: expect.any(String),
                userHandle: expect.any(String)
            },
            clientExtensionResults: {}
        });
        expect(decodeBase64url(result.rawId)).toBe(bufferToStr(passkeyMocks.assertionResponse.rawId));
        expect(decodeBase64url(result.response.clientDataJSON)).toBe(bufferToStr(passkeyMocks.assertionResponse.response.clientDataJSON));
        expect(decodeBase64url(result.response.authenticatorData)).toBe(bufferToStr(passkeyMocks.assertionResponse.response.authenticatorData));
        expect(decodeBase64url(result.response.signature)).toBe(bufferToStr(passkeyMocks.assertionResponse.response.signature));
        expect(decodeBase64url(result.response.userHandle)).toBe(bufferToStr(passkeyMocks.assertionResponse.response.userHandle));
    });

    it('should throw when browser does not support publicKey credentials', async () => {
        navigator.credentials.get.mockResolvedValueOnce(null);
        await expect(requestPasskey(passkeyMocks.requestOptions)).rejects.toBeErrorWithCode(AuthError.passKeyUnavailable);
    });

    it('should throw cancelled error when operation is aborted', async () => {
        const ac = new AbortController();
        navigator.credentials.get.mockImplementationOnce(({ signal }) => {
            expect(signal).toBeInstanceOf(AbortSignal);
            return new Promise((resolve, reject) => {
                signal.addEventListener('abort', () => {
                    reject(signal.reason);
                });
            });
        });
        const error = new Error();
        setTimeout(() => ac.abort(error), 0);
        await expect(requestPasskey(passkeyMocks.requestOptions, ac.signal)).rejects.toBe(error);
    });
});
