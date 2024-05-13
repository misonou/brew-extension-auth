import { AuthContext } from "./extension";

type Fetch = Window['fetch'];
type Axios = import("axios").Axios;
type AxiosRequestConfig = import("axios").AxiosRequestConfig;

export type FetchMiddleware = (request: Request, next: (request: Request) => Promise<Response>) => Promise<Response>;

/**
 * Creates a middleware that sets authorization header and to renew access token automatically when needed.
 * @param app App instance after calling `useAuth`.
 * @param filter Optional filter to opt-in authorization header by condition.
 */
export function createFetchMiddleware(app: Brew.AppInstance<AuthContext>, filter?: (request: Request) => boolean): Fetch & FetchMiddleware;

/**
 * Creates a middleware that sets authorization header and to renew access token automatically when needed.
 * @param app App instance after calling `useAuth`.
 * @param filter Optional filter to opt-in authorization header by condition.
 * @returns A callback that registers interceptors to the axios instance.
 */
export function createAxiosMiddleware(app: Brew.AppInstance<AuthContext>, filter?: (config: AxiosRequestConfig) => boolean): (axios: Axios) => Axios;
