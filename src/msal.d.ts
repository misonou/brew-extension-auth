import { AccountInfo, AuthenticationResult, Configuration, PublicClientApplication } from "@azure/msal-browser";
import { AuthProvider } from "./extension";

export type MsalAuthProvider = AuthProvider<"msal", AccountInfo>;

export interface MsalAuthProviderOptions {
    /**
     * Configurations to be passed to MSAL client application.
     * Unspecified configurations are filled from {@link MsalAuthProviderFactory.defaultConfig}.
     */
    config: Configuration;
    /**
     * Array of scopes the application is requesting access to.
     */
    scopes?: readonly string[];
}

export interface MsalAuthProviderFactory {
    /**
     * @see {@link MsalAuthProviderFactory.setDefault}
     */
    readonly defaultConfig: Partial<Configuration>;

    /**
     * Sets default configurations for MSAL client application, which will be applied when
     * an authentication provider is created without explicitly supplying a {@link PublicClientApplication} instance.
     * Note that it must be called before creating provider.
     * @param config A subset of configurations which is merged into {@link MsalAuthProviderFactory.defaultConfig}.
     */
    setDefault(config: Partial<Configuration>): void;
    /**
     * Creates an authentication provider using default configurations.
     * @param key A unique key.
     * @param clientId Client ID of the app registered in Azure's application registration portal.
     * @param authority Authority URI, typically "https://login.microsoftonline.com/common" or one associated with the tenant.
     * @param scopes Array of scopes the application is requesting access to.
     */
    create(key: string, clientId: string, authority: string, scopes?: readonly string[]): MsalAuthProvider;
    /**
     * Creates an authentication provider using supplied client.
     * @param key A unique key.
     * @param client An MSAL client application.
     * @param options A dictionary containing options.
     */
    create(key: string, client: PublicClientApplication, options?: Pick<MsalAuthProviderOptions, 'scopes'>): MsalAuthProvider;
    /**
     * Creates an authentication provider with the specific options.
     * @param key A unique key.
     * @param options A dictionary containing options.
     */
    create(key: string, options: MsalAuthProviderOptions): MsalAuthProvider;
}

declare const MsalAuthProvider: MsalAuthProviderFactory;
export default MsalAuthProvider;
