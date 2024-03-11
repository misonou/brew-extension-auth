import { errorWithCode, isErrorWithCode } from "zeta-dom/util";
import * as BrewError from "brew-js/errorCode";
import { AuthClient, AuthClientCachedResult, AuthError, AuthProviderLoginRequest, AuthProviderResult, JSONClient } from "@misonou/brew-extension-auth";

export interface DirectusUser {
    appearance: string | null;
    auth_data: string | null;
    avatar: string | null;
    description: string | null;
    email: string;
    email_notifications: boolean;
    external_identifier: string | null;
    first_name: string | null;
    id: string;
    language: string | null;
    last_access: string | null;
    last_name: string | null;
    last_page: string | null;
    location: string | null;
    provider: string;
    role: string | null;
    status: string;
    tags: string[] | null;
    title: string | null;
}

type Result = AuthProviderResult<DirectusUser> & { refreshToken: string };

export default class DirectusAuthClient implements AuthClient<"directus", Result> {
    readonly authType = 'password';
    readonly providerType = 'directus';

    private readonly client: JSONClient;

    constructor(baseUrl: string) {
        this.client = new JSONClient(baseUrl, (req, next) => {
            return next(req).then(v => v?.data, e => this.handleError(e));
        });
    }

    isHandleable() {
        return true;
    }

    async login(params: AuthProviderLoginRequest) {
        const result = await this.client.post('/auth/login', {
            mode: 'json',
            email: params.loginHint,
            password: params.password
        });
        return this.createResult(result);
    }

    async logout() {
        return this.client.post('/auth/logout');
    }

    async refresh(params: AuthClientCachedResult<Result>) {
        const result = await this.client.post('/auth/refresh', {
            mode: 'json',
            refresh_token: params.refreshToken
        });
        return this.createResult(result, params.account);
    }

    private async createResult(data: any, account?: any): Promise<Result> {
        if (!account) {
            account = await this.client.get('/users/me', {
                headers: {
                    authorization: 'Bearer ' + data.access_token
                }
            });
        }
        return {
            account: account,
            accountId: account.id,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresOn: Date.now() + data.expires
        };
    }

    private handleError(error: any) {
        if (isErrorWithCode(error, BrewError.apiError) && error.data) {
            let [innerError] = error.data.errors || [];
            if (innerError?.extensions.code === 'INVALID_CREDENTIALS') {
                throw errorWithCode(AuthError.invalidCredential);
            }
        }
        throw error;
    }
}
