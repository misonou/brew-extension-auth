import Auth from "./extension";
import * as AuthError from "./errorCode";
import AuthProvider from "./provider";

export type * from "./extension";

export default Auth;
export * from "./middleware";

export {
    AuthError,
    AuthProvider
}
