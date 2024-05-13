import { Extension } from "brew-js/core";

export type AuthExtension<T> = Extension<AuthContext<T>>;
export type AuthType = 'password' | 'federated' | 'publicKey';
export type ResolveUserCallback<TProvider, TUser> = (context: TProvider extends AuthProvider<infer K, infer T> ? AuthResult<K, T> : AuthResult) => TUser | Promise<TUser>;

export interface AuthEvent<TUser> extends Zeta.ZetaEventBase {
    /**
     * Gets the user that is currently or has been logged in.
     */
    readonly user: TUser;
}

export interface AuthEventMap<TUser> {
    login: AuthEvent<TUser>;
    logout: AuthEvent<TUser>;
    sessionEnded: Zeta.ZetaAsyncHandleableEvent;
}

export interface AuthProviderResult<T = any> {
    /**
     * Account info that will be passed to {@link AuthOptions.resolveUser}.
     */
    account: T;
    /**
     * A string representating the user, usually user ID, to be cached in local storage.
     */
    accountId: string;
    /**
     * Access token returned from authentication provider.
     * It will be exposed as {@link AuthContext.accessToken}.
     */
    accessToken: string;
    /**
     * A `Date` object or a JavaScript timestamp indicating when the access token will expire.
     */
    expiresOn: Date | number;
}

export interface AuthProviderLoginRequest {
    /**
     * Specifies the preferred way to login.
     */
    interaction: 'popup' | 'redirect';
    /**
     * Login hint, usually user email, to be passed to external authentication provider.
     */
    loginHint?: string;
    /**
     * Password to be passed to authentication provider.
     */
    password?: string;
}

export interface AuthProviderLogoutRequest {
    /**
     * Specifies the preferred way to logout.
     */
    interaction: 'popup' | 'redirect';
    /**
     * Account to logout.
     */
    accountId: string;
    /**
     * Whether user should be logged out completely from other applications for the same single sign-on session.
     */
    singleLogout?: boolean;
}

export interface AuthProviderContext {
    /**
     * Fully qualified URL for redirection after logging in or out through external authentication provider.
     */
    readonly redirectUri: string;
    /**
     * Revokes login session, typically when user has signed out elsewhere.
     *
     * It will emit a handleable `sessionEnd` event before logging out completely.
     * It has no effect if user is not currently logged in with this provider or the `accountId` parameter does not match current one.
     *
     * @param accountId Account to logout. If not specified, the current account will be logged out.
     */
    revokeSession(accountId?: string): void;
}

export interface AuthProviderInfo {
    /**
     * A unique key identifying the provider.
     */
    readonly key: string;
    /**
     * Authentication method used by the provider.
     * - `federated` refers to federated identity provider, like an OpenID connect provider.
     * - `publicKey` refers to passwordless authentication using key-pairs, commonly known as passkeys.
     */
    readonly authType: AuthType;
    /**
     * Type of provider, e.g. `msal` for `MsalAuthProvider`.
     */
    readonly providerType: string;
}

export interface AuthProvider<K = string, T = any> extends AuthProviderInfo {
    readonly providerType: K;

    /**
     * Restores existing login session, or handles authentication result returned
     * from external authentication provider during app initialization.
     * @returns Authentication result when user have logged in, or `null` or `undefined` otherwise.
     */
    init(context: AuthProviderContext): AuthProviderResult<T> | Promise<AuthProviderResult<T> | null | undefined> | null | undefined;
    /**
     * Performs login.
     */
    login(params: AuthProviderLoginRequest, context: AuthProviderContext): Promise<AuthProviderResult<T>>;
    /**
     * Performs logout.
     */
    logout(params: AuthProviderLogoutRequest, context: AuthProviderContext): Promise<void>;
    /**
     * Refreshes current login session.
     */
    refresh(current: AuthProviderResult<T>, context: AuthProviderContext): Promise<AuthProviderResult<T>>;
    /**
     * Returns whether the authentication provider can process the request given the login hint.
     * @param loginHint Login hint, ususally user email, provided by user.
     */
    isHandleable(loginHint: string): boolean | Promise<boolean>;
}

export interface AuthResult<K = string, T = any> {
    /**
     * A unique key identifying the provider.
     */
    readonly provider: string;
    /**
     * Type of identity returned from provider, e.g. `msal` for `MsalAuthProvider`.
     */
    readonly providerType: K;
    /**
     * Identity returned from the provider.
     */
    readonly account: T;
}

export interface AuthOptions<TProviders extends readonly AuthProvider[], TUser = any> {
    /**
     * A list of authentication provider.
     */
    providers: TProviders;
    /**
     * Specifies the preferred way to login when authenticating through external providers.
     * Default is `redirect`.
     */
    interaction?: 'popup' | 'redirect';
    /**
     * Default path to visit after logged in.
     * If not specified, user will be redirected to current path.
     */
    postLoginPath?: string;
    /**
     * Default path to visit after logged out.
     * If not specified, user will be redirected to current path.
     */
    postLogoutPath?: string;
    /**
     * Gather information about current user which will be exposed as {@link AuthContext.user}.
     *
     * The callback will receive an argument of type {@link AuthResult}, and
     * should return object of type {@link TUser}.
     */
    resolveUser: ResolveUserCallback<Zeta.ArrayMember<TProviders>, TUser>;
}

export interface AuthProviderHint {
    /**
     * A string as the key to identify which authentication provider should be used.
     */
    provider?: string;
    /**
     * Authentication method used by the provider, to determine which authentication provider should be used when `provider` is not specified.
     * See {@link AuthProviderInfo.authType}.
     */
    authType?: AuthType;
    /**
     * Type of provider, to determine which authentication provider should be used when `provider` is not specified.
     * See {@link AuthProviderInfo.providerType}.
     */
    providerType?: string;
    /**
     * Login hint, usually user email, to determine which authentication provider should be used when `provider` is not specified.
     * Supplied value will be passed to authentication provider.
     */
    loginHint?: string;
}

export interface LoginOptions extends AuthProviderHint {
    /**
     * Password to be passed to authentication provider.
     */
    password?: string;
    /**
     * Path to visit after logged in.
     */
    returnPath?: string;
}

export interface LogoutOptions {
    /**
     * Whether to also log out from other applications for the same single sign-on session.
     */
    singleLogout?: boolean
    /**
     * Path to visit after logged out.
     */
    returnPath?: string;
}

export interface AuthContext<TUser = any> extends Brew.EventDispatcher<keyof AuthEventMap<TUser>, AuthEventMap<TUser>> {
    /**
     * Returns an object containing information of current user; or `null` when user is not logged in.
     */
    readonly user: TUser | null;

    /**
     * Resolves which authentication provider would be used based on the input.
     * @param hint A set of criteria.
     */
    resolveAuthProvider(hint: AuthProviderHint): Promise<AuthProviderInfo | undefined>;
    /**
     * Gets access token for the logged in user.
     * It will try to refresh access token if the current one is already expired.
     * @param forceRefresh Whether to refresh access token even if it is not expired.
     * @returns The access token, or `null` if user has not logged in.
     */
    acquireToken(forceRefresh?: boolean): Promise<string | null>;
    /**
     * Gets access token for the logged in user.
     * It will try to refresh access token if the current one is already expired.
     * @param callback A callback receiving access token, or `null` if user has not logged in, and a flag indicates whether a refresh could be tried.
     */
    acquireToken<T>(callback: (accessToken: string | null, retryable: boolean) => T): T | Promise<Awaited<T>>;
    /**
     * Logs in using one of the authentication providers.
     * @param options Options for logging in. If multiple authentication providers exists, either `provider` or `loginHint` must be provided.
     * @returns A promise which may resolve after logged in successfully.
     */
    login(options?: LoginOptions): Promise<void>;
    /**
     * Logs out the current user.
     * @param options Options for logging out.
     * @returns A promise which may resolve after logged out successfully.
     */
    logout(options?: LogoutOptions): Promise<void>;

    /**
     * Initialize the extension.
     * @param options A dictionary containing options.
     */
    useAuth<TProviders extends readonly AuthProvider[]>(options: AuthOptions<TProviders, TUser>): void;
}

declare const Auth: AuthExtension<any>;
export default Auth;
