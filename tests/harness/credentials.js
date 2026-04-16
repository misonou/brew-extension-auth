import { jest } from "@jest/globals";

function strToBuffer(str) {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i += 1) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
}

export function bufferToStr(buffer) {
    return Buffer.from(buffer).toString('utf8');
}

export function decodeBase64url(base64) {
    return Buffer.from(base64, 'base64url').toString('utf8');
}

export function encodeBase64url(str) {
    return Buffer.from(str, 'utf8').toString('base64url');
}

/** @type {PublicKeyCredential} */
const attestationResponse = {
    id: 'credential-id',
    type: 'public-key',
    rawId: strToBuffer('credential-id'),
    response: {
        clientDataJSON: strToBuffer('{}'),
        attestationObject: strToBuffer('attestation-object'),
    },
};
Object.defineProperty(attestationResponse.response, 'getTransports', {
    value: function () {
        return ['hybrid', 'internal'];
    },
    writable: true,
    enumerable: false,
    configurable: true,
});

/** @type {PublicKeyCredential} */
const assertionResponse = {
    id: 'credential-id',
    type: 'public-key',
    rawId: strToBuffer('credential-id'),
    response: {
        clientDataJSON: strToBuffer('{}'),
        authenticatorData: strToBuffer('authenticator-data'),
        signature: strToBuffer('signature'),
        userHandle: strToBuffer('user-handle')
    },
};

/** @type {PublicKeyCredentialCreationOptionsJSON} */
const creationOptions = {
    challenge: encodeBase64url('challenge'),
    rp: {
        name: 'WebAuthn Demo',
        id: 'localhost'
    },
    user: {
        id: encodeBase64url('user-id'),
        name: 'test_user',
        displayName: 'test_user'
    },
    pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
    ],
    timeout: 60000,
    attestation: 'none',
    excludeCredentials: [
        {
            id: encodeBase64url('credential-id'),
            transports: ['hybrid', 'internal'],
            type: 'public-key'
        }
    ],
    authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        requireResidentKey: false
    },
    extensions: {
        credProps: true
    },
    hints: []
};

/** @type {PublicKeyCredentialRequestOptionsJSON} */
const requestOptions = {
    challenge: encodeBase64url('challenge'),
    timeout: 60000,
    rpId: 'localhost',
    allowCredentials: [
        {
            id: encodeBase64url('credential-id'),
            transports: ['hybrid', 'internal'],
            type: 'public-key'
        }
    ],
    userVerification: 'preferred',
    extensions: {
        credProps: true
    },
    hints: []
};

navigator.credentials = {
    create: jest.fn().mockResolvedValue(attestationResponse),
    get: jest.fn().mockResolvedValue(assertionResponse),
};

export const passkeyMocks = {
    attestationResponse,
    assertionResponse,
    creationOptions,
    requestOptions,
};
