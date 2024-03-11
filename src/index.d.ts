import Auth from "./extension";
import * as AuthError from "./errorCode";
import AuthProvider from "./provider";

export type * from "./extension";
export type * from "./provider";

export default Auth;
export * from "./middleware";
export * from "./util";

export {
    AuthError,
    AuthProvider
}
