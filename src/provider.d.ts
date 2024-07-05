import { AuthProvider, AuthProviderContext, AuthProviderInfo, AuthProviderLoginRequest, AuthProviderLogoutRequest, AuthProviderResult } from "./extension";

export type AuthClientCachedResult<T extends AuthProviderResult> = Omit<T, 'account'> & Pick<Partial<T>, 'account'>;

export interface AuthClient<K extends string, T extends AuthProviderResult> {
    /**
     * @see {@link AuthProviderInfo.authType}
     */
    readonly authType: string;
    /**
     * @see {@link AuthProviderInfo.providerType}
     */
    readonly providerType: K;

    /**
     * Performs login.
     */
    login(params: AuthProviderLoginRequest, context: AuthProviderContext): Promise<T>;
    /**
     * Performs logout.
     */
    logout(params: AuthProviderLogoutRequest, context: AuthProviderContext): Promise<void>;
    /**
     * Refreshes current login session.
     */
    refresh(current: AuthClientCachedResult<T>, context: AuthProviderContext): Promise<T>;
    /**
     * Returns whether the authentication provider can process the request given the login hint.
     * @param loginHint Login hint, ususally user email, provided by user.
     */
    isHandleable(loginHint: string): boolean | Promise<boolean>;
}

export interface AuthProviderFactory {
    /**
     * Creates an authentication provider from a stateless authentication client.
     * @param key A unique key identifying the provider.
     * @param client A client that implements authentication request to server.
     */
    from<K = string, T = any>(key: string, client: AuthClient<K, T>): AuthProvider<K, T>;
}

declare const AuthProvider: AuthProviderFactory;
export default AuthProvider;
