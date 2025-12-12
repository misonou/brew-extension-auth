export type JSONRequestMiddleware = (request: Request, next: (request: Request) => Promise<any>) => Promise<any>;

/**
 * Error thrown from {@link JSONClient} by default, which can be intercepted using middleware.
 */
export interface JSONRequestError extends Error {
    /**
     * Gets the HTTP status code responded from server.
     */
    readonly status: number;
    /**
     * Gets data parsed from response body; or `null` when body is not a valid JSON document.
     */
    readonly data: any;
    /**
     * Gets error thrown when parsing response body; or `null` when body is parsed successfully.
     */
    readonly error: Error | null;
}


/**
 * @deprecated Use `createApiClient` from `brew-js`.
 */
export default class JSONClient {
    constructor(baseUrl: string, middleware?: JSONRequestMiddleware);

    readonly baseUrl: string;

    request<T = any>(request: string | URL | Request, options?: RequestInit): Promise<T>;
    get<T = any>(path: string, options?: RequestInit): Promise<T>;
    post<T = any>(path: string, body?: any, options?: RequestInit): Promise<T>;
    put<T = any>(path: string, body?: any, options?: RequestInit): Promise<T>;
    patch<T = any>(path: string, body?: any, options?: RequestInit): Promise<T>;
    delete<T = any>(path: string, body?: any, options?: RequestInit): Promise<T>;
}
