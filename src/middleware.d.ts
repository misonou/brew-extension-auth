import { AuthContext } from "./extension";

type Axios = import("axios").Axios;
type Fetch = Window['fetch'];

export type FetchMiddleware = (request: Request, next: (request: Request) => Promise<Response>) => Promise<Response>;

/**
 * Creates a middleware that sets authorization header and to renew access token automatically when needed.
 */
export function createFetchMiddleware(app: Brew.AppInstance<AuthContext>): Fetch & FetchMiddleware;

/**
 * Creates a middleware that sets authorization header and to renew access token automatically when needed.
 */
export function createAxiosMiddleware(app: Brew.AppInstance<AuthContext>): (axios: Axios) => Axios;
