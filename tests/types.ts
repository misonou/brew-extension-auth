import { expectTypeOf } from "expect-type";
import brew from "brew-js";
import Auth, { AuthExtension, AuthChallenge, AuthProvider, AuthResult, AuthProviderResult, AuthProviderContext } from "../src/extension";
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

type OtpEmailChallenge = AuthChallenge<'otp-email', { email: string }, string>;
type CustomChallenge = AuthChallenge<'custom', undefined, void>;

expectTypeOf((<AuthChallenge>_).value).toBeAny();
expectTypeOf((<AuthChallenge>_).continueWith).parameter(0).toBeAny();
expectTypeOf((<AuthChallenge>_).continueWith('')).toEqualTypeOf<Promise<AuthChallenge | undefined>>();

expectTypeOf((<OtpEmailChallenge>_).value).toEqualTypeOf<{ email: string }>();
expectTypeOf((<OtpEmailChallenge>_).continueWith('')).toEqualTypeOf<Promise<AuthChallenge | undefined>>();
expectTypeOf((<CustomChallenge>_).value).toBeUndefined();
expectTypeOf((<CustomChallenge>_).continueWith()).toEqualTypeOf<Promise<AuthChallenge | undefined>>();

// @ts-expect-error: incorrect value type for continueWith of otp-email challenge
(<OtpEmailChallenge>_).continueWith(123);
// @ts-expect-error: should not pass value for continueWith of custom challenge
(<CustomChallenge>_).continueWith('some value');

expectTypeOf((<AuthProviderContext>_).challenge('any', _)).toEqualTypeOf<Promise<any>>();
expectTypeOf((<AuthProviderContext>_).challenge('any', _, (_: any) => 1)).toEqualTypeOf<Promise<number>>();
expectTypeOf((<AuthProviderContext>_).challenge('any', _, (_: any) => 1 as const)).toEqualTypeOf<Promise<1>>();

expectTypeOf((<AuthProviderContext>_).challenge<OtpEmailChallenge>('otp-email', { email: 'test@example.com' })).toEqualTypeOf<Promise<string>>();
expectTypeOf((<AuthProviderContext>_).challenge<OtpEmailChallenge, number>('otp-email', { email: 'test@example.com' }, (_: string) => 1)).toEqualTypeOf<Promise<number>>();

// @ts-expect-error: missing value for otp-email challenge
(<AuthProviderContext>_).challenge<OtpEmailChallenge>('otp-email', {});
// @ts-expect-error: incorrect value type for otp-email challenge
(<AuthProviderContext>_).challenge<OtpEmailChallenge>('any', _);

// -------------------------------------
// provider.d.ts

expectTypeOf(AuthProviderFactory.from('test', <AuthClient<'key', AuthProviderResult<User>>>_)).toEqualTypeOf<AuthProvider<'key', User>>();
