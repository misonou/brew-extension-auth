import { defineHiddenProperty, each } from "zeta-dom/util";
import { createApiClient } from "brew-js/util/fetch";
import * as AuthErrorCode from "../errorCode.js";

function JSONClient(baseUrl, middleware) {
    this.baseUrl = baseUrl;
    this.request = createApiClient(baseUrl, {
        request: middleware,
        error: function (error) {
            if (error.status === 401) {
                error.code = AuthErrorCode.invalidCredential;
            }
        }
    });
    this.request.use(function (req, next) {
        req.headers.set('accept', 'application/json');
        return next(req);
    });
}

each('get post put patch delete', function (i, v) {
    defineHiddenProperty(JSONClient.prototype, v, function (path, body, options) {
        return this.request[v](path, body, options);
    });
});

export default JSONClient;
