# About brew-extension-auth

This is a preview extension for single sign-on in [brew.js](https://www.npmjs.com/package/brew-js) application.

Currently supported single sign-on providers:
- MSAL.js (Microsoft Entra ID)

Working on:
- platform-dependent password login using fetch
- generic OAuth2 client

## Usage

```typescript
import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth from "@misonou/brew-extension-auth";
import MsalAuthProvider from "@misonou/brew-extension-auth/msal";

export const app = brew.with(Router, Auth)(app => {
    app.useRouter({
        /* router options */
    });
    app.useAuth({
        providers: [
            // create provider using factory method
            MsalAuthProvider.create('microsoft', clientId, authority, scopes)
        ],
        resolveUser({ identity }) {
            return identity; // value will be exposed as `app.user`
        }
    });
});
```

### Typed user object

By casting the extension with specific user object type, `app.user` will be enforced with the given type.

> If there are multiple identity providers, it may be advantageous to unify the user object by `resolveUser`.

```typescript
import brew from "brew-js/app";
import Router from "brew-js/extension/router";
import Auth, { AuthExtension } from "@misonou/brew-extension-auth";

interface User {
    id: string;
    // ...
}

brew.with(Router, Auth as AuthExtension<User>)(app => {
    app.useAuth({
        // ...
        resolveUser() {
            // require to return an object of type `User`
            return createMyUserObject();
        }
    })
});
```

## API

```typescript
// performs login and logout
function onClickLogin() {
    return app.login();
}
function onClickLogout() {
    return app.logout();
}

// events
app.on('login', e => {
    console.log(e.user);
});
app.on('logout', e => {
    // user that was logged in (previously exposed as app.user)
    console.log(e.user);
});
app.on('sessionEnded', e => {
    // user has logged out in other tabs
    // user will be softly logged out after sessionExpired is handled
});
```

### Using return path

```typescript
// redirect to the page user originally liked to access after logging in
app.login({
    returnPath: app.canNavigateBack ? undefined : app.initialPath
});
```

### Using multiple providers

When there are multiple providers, either `provider` or `loginHint` must be provided to `app.login` so that
the correct provider can be resolved.

```typescript
// setup
app.useAuth({
    providers: [
        MsalAuthProvider.create('microsoft1', clientId1, authority1, scopes),
        MsalAuthProvider.create('microsoft2', clientId2, authority2, scopes),
    ],
    // ...
});

// login
app.login({ provider: 'microsoft1' }); //or
app.login({ loginHint: 'test@tenant-domain1.com' });
```

> Note that the first suitable provider will be picked, therefore
  provider that accept all login IDs should be put at last.


## Middleware

Middleware is available for DOM fetch and [axios](https://axios-http.com/) to which
- automatically set `Authorization` header with bearer token when user is logged in
- when necessary, the provider will try to renew access token.

After creating app with auth extension, you can use the corresponding function
to create middleware.

### Fetch

```typescript
import { createFetchMiddleware } from "@misonou/brew-extension-auth";

// fetch without next middleware
const fetch = createFetchMiddleware(app);
fetch(new Request('https://example.org/api/v1'));
fetch('https://example.org/api/v1', { /* ... */ });
```

With other utility such as [`fetch-run`](https://npmjs.com/package/fetch-run):

```typescript
import { Api } from "fetch-run";
import { createFetchMiddleware } from "@misonou/brew-extension-auth";

const fetch = createFetchMiddleware(app);
const api = Api.create('https://example.org/api/v1');
api.use(next => req => fetch(req, next));
```

### axios

```typescript
import axios from "axios";
import { createAxiosMiddleware } from "@misonou/brew-extension-auth";

const client = axios.create();
createAxiosMiddleware(app)(client);
```

## Providers

### MSAL.js

> Requires to install [`@azure/msal-browser`](https://www.npmjs.com/package/@azure/msal-browser).

The simplest way to create a provider is to have your client ID, authority and scopes:

```typescript
import MsalAuthProvider from "@misonou/brew-extension-auth/msal";

MsalAuthProvider.create('microsoft',
    clientId, // Client ID on App registration
    'https://login.microsoftonline.com/common', // can be organizations or your tenant's authority
    ['openid', 'profile']);
```

The MSAL applications will be initialized with default configuration:

```typescript
// it must be before calling MsalAuthProvider.create
MsalAuthProvider.setDefault({
    auth: { /* ... */ },
    cache: { /* ... */ },
    logging: { /* ... */ },
    telemetry: { /* ... */ }
});
```

You can also create provider with more flexibility by creating PCA yourself:

```typescript
import { PublicClientApplication } from "@azure/msal-browser";
import MsalAuthProvider from "@misonou/brew-extension-auth/msal";

MsalAuthProvider.create('microsoft',
    new PublicClientApplication({ /* ... */ }),
    { scopes: ['openid', 'profile'] });
```
