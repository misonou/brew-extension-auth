import { expectTypeOf } from "expect-type";
import brew from "brew-js";
import Auth, { AuthExtension, AuthProvider, AuthResult, AuthProviderResult } from "../src/extension";
import { default as AuthProviderFactory, AuthClient } from "src/provider";

declare const _: unknown;

interface ProviderAccount1 {
    a: string;
}
interface ProviderAccount2 {
    b: string;
}
interface User {
    id: string;
}

// -------------------------------------
// extension.d.ts

brew.with(Auth)(app => {
    app.useAuth({
        provider: <AuthProvider>_
    });
    app.useAuth({
        provider: <AuthProvider<'test'>>_,
        resolveUser: (_1: AuthResult<'test', any>) => _
    });
    app.useAuth({
        providers: [
            <AuthProvider<'p1', ProviderAccount1>>_,
            <AuthProvider<'p2', ProviderAccount2>>_,
        ],
        resolveUser(context: AuthResult<'p1', ProviderAccount1> | AuthResult<'p2', ProviderAccount2>) {
            if (context.providerType === 'p1') {
                return context.account.a;
            } else {
                return context.account.b;
            }
        }
    });

    expectTypeOf(app.user).toBeAny();
});

brew.with(<AuthExtension<User>>Auth)(app => {
    app.useAuth({
        provider: <AuthProvider>_
    });
    app.useAuth({
        provider: <AuthProvider<'test'>>_,
        resolveUser: (_1: AuthResult<'test', any>) => <User>_
    });
    app.useAuth({
        provider: <AuthProvider<'test'>>_,
        // @ts-expect-error
        resolveUser: (_1: AuthResult<'test', any>) => <{}>_
    });

    expectTypeOf(app.user).toEqualTypeOf<User | null>();
    app.on('login', e => {
        expectTypeOf(e.user).toEqualTypeOf<User>();
    });
    app.on('logout', e => {
        expectTypeOf(e.user).toEqualTypeOf<User | null>();
    });
});

// -------------------------------------
// provider.d.ts

expectTypeOf(AuthProviderFactory.from('test', <AuthClient<'key', AuthProviderResult<User>>>_)).toEqualTypeOf<AuthProvider<'key', User>>();
