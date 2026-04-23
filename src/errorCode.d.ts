/**
 * No longer used.
 */
export declare const loggedIn: "brew/auth-logged-in";
/**
 * Indicates authentication provider cannot be resolved from options when using `app.login()` or `app.acquireToken()`.
 * It can be caused by invalid provider key, or there is none or multiple providers satistying the requirement such as `providerType` or `loginHint`.
 */
export declare const noProvider: "brew/auth-no-provider";
/**
 * Indicates the specified user is not logged in when trying to refresh token using `app.acquireToken()`.
 * Authentication providers should use this error code when appropriate.
 */
export declare const userNotLoggedIn: "brew/auth-user-not-logged-in";
/**
 * Indicates failure to create or retreieve a passkey when using `createPasskey()` or `requestPasskey()`. It can be caused by various reasons such as:
 * - user cancelled the operation, or
 * - platform does not support public key authentication, or
 * - operation is not allowed due to other reasons such as security policy.
 */
export declare const passKeyUnavailable: "brew/auth-passkey-unavailable";
/**
 * Indicates the credential is missing when trying to authenticate using `app.login()`.
 * Authentication providers should use this error code when appropriate.
 */
export declare const missingCredential: "brew/auth-missing-credential";
/**
 * Indicates the credential is invalid when trying to authenticate using `app.login()`.
 * Authentication providers should use this error code when appropriate.
 */
export declare const invalidCredential: "brew/auth-invalid-credential";
