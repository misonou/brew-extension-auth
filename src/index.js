import Auth from "./extension.js";
import * as AuthError from "./errorCode.js";
import AuthProvider from "./provider.js";

export default Auth;
export * from "./middleware.js";
export * from "./util.js";

export {
    AuthError,
    AuthProvider
}
