import { errorWithCode, isErrorWithCode } from "zeta-dom/util";
import * as BrewError from "brew-js/errorCode";
import { AuthError } from "@misonou/brew-extension-auth";
import { createApiClient } from "brew-js/util/fetch";

export default class DirectusAuthClient {
    constructor(baseUrl) {
        this.authType = 'password';
        this.providerType = 'directus';
        this.client = createApiClient(baseUrl, {
            data: v => v?.data,
            error: e => this.handleError(e)
        });
    }

    isHandleable() {
        return true;
    }

    async login(params) {
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

    async refresh(params) {
        const result = await this.client.post('/auth/refresh', {
            mode: 'json',
            refresh_token: params.refreshToken
        });
        return this.createResult(result, params.account);
    }

    async createResult(data, account) {
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

    handleError(error) {
        if (isErrorWithCode(error, BrewError.apiError) && error.data) {
            let [innerError] = error.data.errors || [];
            if (innerError?.extensions.code === 'INVALID_CREDENTIALS') {
                throw errorWithCode(AuthError.invalidCredential);
            }
        }
        throw error;
    }
}
