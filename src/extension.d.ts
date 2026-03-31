import { Extension } from "brew-js/core";

export type AuthExtension<T> = Extension<AuthContext<T>>;
export type AuthEvent<TUser> = AuthLoginEvent<TUser> | AuthLogoutEvent<TUser>;
export type AuthType = 'password' | 'federated' | 'publicKey';
export type ResolveUserCallback<TProvider, TUser> = (context: TProvider extends AuthProvider<infer K, infer T> ? AuthResult<K, T> : AuthResult) => TUser | Promise<TUser>;

export interface AuthLoginEvent<TUser> extends Zeta.ZetaEventBase {
    /**
     * Gets the user that is currently logged in.
     */
    readonly user: TUser;
    /**
     * Gets whether the same user has been logged in.
     *
     * The user can already be logged in in previous visit in the same tab; or the session is recovered from browser cache.
     * It is always `false` when `login` event is not fired on app start, or when {@link AuthLoginEvent.sessionChanged} is `true`.
     */
    readonly sessionResumed: boolean;
    /**
     * Gets whether a different user has been logged in.
     *
     * It is always `false` when {@link AuthLoginEvent.sessionResumed} is `true`.
     */
    readonly sessionChanged: boolean;
    /**
     * Gets the way how the user is logged in.
     *
     * It has the following possible values:
     * - `redirect`: user is logged in through redirection from external provider
     * - `none`: user is logged in through session recovery without redirection
     * - `user`: user is logged in through explicit login action in the current session
     */
    readonly interaction: 'redirect' | 'none' | 'user';
}

export interface AuthLogoutEvent<TUser> extends Zeta.ZetaEventBase {
    /**
     * Gets the user that was logged in.
     *
     * Note that `null` is returned when `logout` event is fired on app start, in case like
     * user is logged out through external page and is then redirected back; or
     * previous session is expired at the time current page is loaded.
     */
    readonly user: TUser | null;
    /**
     * Gets the way how the user is logged out.
     *
     * It has the following possible values:
     * - `redirect`: user is logged out through redirection from external provider
     * - `none`: user is logged out when the session is expired or revoked
     * - `user`: user is logged out through explicit logout action in the current session
     */
    readonly interaction: 'redirect' | 'none' | 'user';
}

export interface AuthEventMap<TUser> {
    login: AuthLoginEvent<TUser>;
    logout: AuthLogoutEvent<TUser>;
    sessionEnded: Zeta.ZetaAsyncHandleableEvent;
}

export interface AuthProviderAccountInfo<T = any> {
    /**
     * Account info that will be passed to {@link AuthOptions.resolveUser}.
     */
    account: T;
    /**
     * A string representating the user, usually user ID.
     */
    accountId: string;
    /**
     * Username for user.
     */
    username?: string;
    /**
     * Display name for user.
     */
    name?: string;
    /**
     * Email address for user.
     */
    email?: string;
    /**
     * URL for user's avatar, which can be used in UI to represent user.
     */
    avatarUrl?: string;
}

export interface AuthProviderResult<T = any> extends AuthProviderAccountInfo<T> {
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
     * @deprecated Retrievable from the {@link AuthProviderContext} object which is passed to provider as the last argument.
     */
    interaction: 'popup' | 'redirect';
    /**
     * Account ID associated to existing session.
     */
    accountId?: string;
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
     * @deprecated Retrievable from the {@link AuthProviderContext} object which is passed to provider as the last argument.
     */
    interaction: 'popup' | 'redirect';
    /**
     * Account to logout.
     */
    accountId: string;
    /**
     * Whether user should be logged out completely from other applications for the same single sign-on session.
     * @deprecated This option is not currently supported and will be removed in the future.
     */
    singleLogout?: boolean;
}

export interface AuthProviderTokenRequest<T = any> {
    /**
     * Account object.
     */
    account?: T;
    /**
     * A string representating the user, usually user ID, to be cached in local storage.
     */
    accountId: string;
}

export interface AuthProviderContext {
    /**
     * Specifies the preferred way to logout.
     */
    readonly interaction: 'popup' | 'redirect';
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

export interface AuthProvider<K extends string = string, T = any> extends AuthProviderInfo {
    readonly providerType: K;

    /**
     * Performs initialization.
     */
    init(context: AuthProviderContext): void | Promise<void>;
    /**
     * Gets all accounts that have login sessions.
     */
    getAllAccounts(context: AuthProviderContext): AuthProviderAccountInfo<T>[] | Promise<AuthProviderAccountInfo<T>[]>;
    /**
     * Restores existing login session.
     */
    getActiveAccount(context: AuthProviderContext): AuthProviderResult<T> | null | undefined | Promise<AuthProviderResult<T> | null | undefined>;
    /**
     * Sets active account, so that current login session can be restored in the future.
     */
    setActiveAccount(account: AuthProviderResult<T> | null, context: AuthProviderContext): void;
    /**
     * Handles authentication result returned from external authentication provider during app initialization.
     */
    handleLoginRedirect(context: AuthProviderContext): AuthProviderResult<T> | null | undefined | Promise<AuthProviderResult<T> | null | undefined>;
    /**
     * Performs login.
     */
    login(params: AuthProviderLoginRequest, context: AuthProviderContext): Promise<AuthProviderResult<T>>;
    /**
     * Performs logout.
     */
    logout(params: AuthProviderLogoutRequest, context: AuthProviderContext): Promise<void>;
    /**
     * Refreshes a login session.
     */
    refresh(params: AuthProviderTokenRequest<T>, context: AuthProviderContext): Promise<AuthProviderResult<T>>;
    /**
     * Returns whether the authentication provider can process the request given the login hint.
     * @param loginHint Login hint, ususally user email, provided by user.
     */
    isHandleable(loginHint: string): boolean | Promise<boolean>;
}

export interface AuthIdentity {
    /**
     * A unique key identifying the provider.
     */
    readonly provider: string;
    /**
     * A string representating the user, usually user ID.
     */
    readonly accountId: string;
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
    /**
     * A string representating the user, usually user ID.
     */
    readonly accountId: string;
    /**
     * Display name for user. If provider does not return display name, username or account ID will be used.
     */
    readonly name: string;
    /**
     * Username for user. If provider does not return username, account ID will be used.
     */
    readonly username: string;
    /**
     * Email address for user.
     */
    readonly email: string | null;
    /**
     * URL for user's avatar, which can be used in UI to represent user.
     */
    readonly avatarUrl: string | null;
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

export type AuthSingleProviderOptions<TProvider extends AuthProvider, TUser> =
    TProvider extends AuthProvider<any, TUser> ? AuthSimpleOptions<TProvider, TUser> :
    AuthSimpleOptionsWithResolve<TProvider, TUser>;

type CommonOptions = Pick<AuthOptions<any>, 'interaction' | 'postLoginPath' | 'postLogoutPath'>;

interface AuthSimpleOptions<TProvider extends AuthProvider, TUser> extends CommonOptions {
    /**
     * An authentication provider.
     */
    provider: TProvider;
    /**
     * Gather information about current user which will be exposed as {@link AuthContext.user}.
     * If callback is not given, {@link AuthContext.user} will return to account object returned by the provider.
     */
    resolveUser?: ResolveUserCallback<TProvider, TUser>;
}

interface AuthSimpleOptionsWithResolve<TProvider extends AuthProvider, TUser> extends CommonOptions {
    /**
     * An authentication provider.
     */
    provider: TProvider;
    /**
     * Gather information about current user which will be exposed as {@link AuthContext.user}.
     */
    resolveUser: ResolveUserCallback<TProvider, TUser>;
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
     * @deprecated This option is not currently supported and will be removed in the future.
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
     * Gets all accounts that have login sessions.
     */
    getAllAccounts(): Promise<AuthResult[]>;
    /**
     * Resolves which authentication provider would be used based on the input.
     * @param hint A set of criteria.
     */
    resolveAuthProvider(hint: AuthProviderHint): Promise<AuthProviderInfo | null>;
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
    acquireToken<T>(callback: (accessToken: string | null, retryable: boolean) => T): Promise<Awaited<T>>;
    /**
     * Gets access token for the specified user.
     * @param account An object identifying the user with provider key and account ID.
     */
    acquireToken(account: AuthIdentity): Promise<string>;
    /**
     * Logs in using one of the authentication providers.
     * @param options Options for logging in. If multiple authentication providers exists, either `provider` or `loginHint` must be provided.
     * @returns A promise which may resolve after logged in successfully.
     */
    login(options?: LoginOptions): Promise<void>;
    /**
     * Logs in as a specific user that has been previously authenticated.
     * @param account An object identifying the user with provider key and account ID.
     * @returns A promise which may resolve after logged in successfully.
     */
    login(account: AuthIdentity): Promise<void>;
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
    /**
     * Initialize the extension.
     * @param options A dictionary containing options.
     */
    useAuth<TProvider extends AuthProvider>(options: AuthSingleProviderOptions<TProvider, TUser>): void;
}

declare const Auth: AuthExtension<any>;
export default Auth;
