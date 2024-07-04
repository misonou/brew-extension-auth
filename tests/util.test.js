import { jest } from "@jest/globals";
import { mockFn } from "@misonou/test-utils";
import { JSONClient } from "src/util";

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

        fetch.mockResolvedValueOnce(new Response('{"data":{"foo":"bar"}}'));
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
        fetch.mockResolvedValueOnce(new Response('{"error":"foo"}', { status: 500 }));
        await expect(client.get('/a')).rejects.toBeErrorWithCode('brew/api-error', { status: 500, data: { error: 'foo' } });

        fetch.mockResolvedValueOnce(new Response('xxx', { status: 500 }));
        await expect(client.get('/a')).rejects.toBeErrorWithCode('brew/api-error', { status: 500, data: null });

        fetch.mockResolvedValueOnce(new Response('{"error":"foo"}', { status: 401 }));
        await expect(client.get('/a')).rejects.toBeErrorWithCode('brew/auth-invalid-credential', { status: 401, data: { error: 'foo' } });
    });

    it('should not throw if response is not a valid JSON', async () => {
        fetch.mockResolvedValueOnce(new Response('xxx'));
        await expect(client.get('/a')).resolves.toBeNull();
    });
});
