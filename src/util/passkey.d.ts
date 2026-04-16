export interface PublicKeyCredentialCreationResultJSON {
    id: string;
    type: string;
    rawId: string;
    response: {
        clientDataJSON: string;
        attestationObject: string;
        transports: string[];
    };
    clientExtensionResults: any;
}

export interface PublicKeyCredentialRequestResultJSON {
    id: string;
    type: string;
    rawId: string;
    response: {
        clientDataJSON: string;
        authenticatorData: string;
        signature: string;
        userHandle: string;
    };
    clientExtensionResults: any;
}

/**
 * Creates a new passkey.
 *
 * It is a wrapper of {@link CredentialsContainer.create} that transforms base64-encoded values to
 * array buffers for use with the Credential Management API and back to base64-encoded values for transmission to server.
 *
 * @param options Configuration options received from server for passkey creation.
 * @param signal An optional signal object to abort the passkey creation request.
 * @returns A promise that resolves to passkey data that can be sent to server for registration, or rejects with either abort reason or error with code `brew/auth-passkey-unavailable`.
 * @example
 * ```javascript
 * const client = createApiClient(BASE_URL);
 * const options = await client.get('/api/register/options');
 * const payload = await createPasskey(options);
 * await client.post('/api/register/verify', payload);
 * ```
 */
export function createPasskey(options: PublicKeyCredentialCreationOptionsJSON, signal?: AbortSignal): Promise<PublicKeyCredentialCreationResultJSON>;

/**
 * Requests an existing passkey.
 *
 * It is a wrapper of {@link CredentialsContainer.get} that transforms base64-encoded values to
 * array buffers for use with the Credential Management API and back to base64-encoded values for transmission to server.
 *
 * @param options Configuration options received from server for passkey request.
 * @param signal An optional signal object to abort the passkey request.
 * @returns A promise that resolves to passkey data that can be sent to server for verification, or rejects with either abort reason or error with code `brew/auth-passkey-unavailable`.
 * @example
 * ```javascript
 * const client = createApiClient(BASE_URL);
 * const options = await client.get('/api/login/options');
 * const payload = await requestPasskey(options);
 * await client.post('/api/login/verify', payload);
 * ```
 */
export function requestPasskey(options: PublicKeyCredentialRequestOptionsJSON, signal?: AbortSignal): Promise<PublicKeyCredentialRequestResultJSON>;
