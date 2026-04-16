import { errorWithCode, extend, is, mapObject, repeat, throwIfAborted } from "zeta-dom/util";
import * as AuthError from "../errorCode.js";

const PublicKeyCredential = window.PublicKeyCredential || function () { };
const parseCreationOptionsFromJSON = PublicKeyCredential.parseCreationOptionsFromJSON || function (options) {
    return extend({}, options, {
        challenge: base64urlToBuffer(options.challenge),
        user: extend({}, options.user, {
            id: base64urlToBuffer(options.user.id)
        }),
        excludeCredentials: (options.excludeCredentials || []).map(function (credential) {
            return extend({}, credential, {
                id: base64urlToBuffer(credential.id)
            });
        })
    });
}
const parseRequestOptionsFromJSON = PublicKeyCredential.parseRequestOptionsFromJSON || function (options) {
    return extend({}, options, {
        challenge: base64urlToBuffer(options.challenge),
        allowCredentials: (options.allowCredentials || []).map(function (credential) {
            return extend({}, credential, {
                id: base64urlToBuffer(credential.id)
            });
        })
    });
};
const credentialToJSON = PublicKeyCredential.prototype.toJSON || function () {
    var credential = this;
    return {
        id: credential.id,
        type: credential.type,
        rawId: bufferToBase64url(credential.rawId),
        response: credentialResponseToJSON(credential.response),
        clientExtensionResults: credential.getClientExtensionResults ? credential.getClientExtensionResults() : {}
    };
};

function bufferToBase64url(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = String.fromCharCode.apply(null, bytes);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlToBuffer(value) {
    var padding = value.length % 4;
    var base64 = value.replace(/-/g, '+').replace(/_/g, '/') + (padding ? repeat('=', 4 - padding) : '');
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function credentialResponseToJSON(response) {
    var result = mapObject(response, function (v) {
        return is(v, ArrayBuffer) ? bufferToBase64url(v) : v;
    });
    return extend(result, response.getTransports && {
        transports: response.getTransports()
    });
}

function handleCredentialResult(credential) {
    if (!credential) {
        throw errorWithCode(AuthError.passKeyUnavailable, 'Browser does not support public-key credentials');
    }
    return credentialToJSON.call(credential);
}

function wrapError(signal, error) {
    throwIfAborted(signal);
    throw errorWithCode(AuthError.passKeyUnavailable, error);
}

export function createPasskey(options, signal) {
    return navigator.credentials.create({
        publicKey: parseCreationOptionsFromJSON(options),
        signal: signal
    }).then(handleCredentialResult, wrapError.bind(0, signal));
}

export function requestPasskey(options, signal) {
    return navigator.credentials.get({
        publicKey: parseRequestOptionsFromJSON(options),
        signal: signal
    }).then(handleCredentialResult, wrapError.bind(0, signal));
}
