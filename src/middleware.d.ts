import { AuthContext } from "./extension";

type Axios = import("axios").Axios;

export interface FetchMiddleware {
    /**
     * Fetches the specified resources.
     * Authorization header will be set and access token will be refreshed automatically when needed.
     * @param request A URL pointing to a resource to be fetched or a `Request` object.
     * @param options Fetch options.
     */
    (request: string | URL | Request, options?: RequestInit): Promise<Response>;
    /**
     * Sets authorization header. Access token will be refreshed automatically when needed.
     * @param request A `request` object.
     * @param next Next middleware.
     */
    (request: Request, next: (request: Request) => Promise<Response>): Promise<Response>;
}

/**
 * Creates a middleware that sets authorization header and to renew access token automatically when needed.
 */
export function createFetchMiddleware(app: Brew.AppInstance<AuthContext>): FetchMiddleware;

/**
 * Creates a middleware that sets authorization header and to renew access token automatically when needed.
 */
export function createAxiosMiddleware(app: Brew.AppInstance<AuthContext>): (axios: Axios) => Axios;
