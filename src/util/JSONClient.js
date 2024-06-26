import { defineHiddenProperty, each, errorWithCode, extend, is } from "zeta-dom/util";
import { combinePath } from "brew-js/util/path";
import * as BrewError from "brew-js/errorCode";

function getOptionsWithBody(method, body, options) {
    options = options || {};
    return extend({}, options, {
        method: method,
        body: JSON.stringify(body),
        headers: extend({}, options.headers, {
            'content-type': 'application/json'
        })
    });
}

function handleResult(response, data, error) {
    if (response.ok) {
        return data;
    }
    throw errorWithCode(BrewError.apiError, '', {
        data: data,
        error: error || null,
        status: response.status
    });
}

function fetchJSON(request, next) {
    request.headers.set('accept', 'application/json');
    return (next || fetch)(request).then(function (response) {
        return response.json().then(function (data) {
            return handleResult(response, data);
        }, function (e) {
            // assume empty for non-JSON response with 2xx status
            return handleResult(response, null, e);
        });
    });
}

function JSONClient(baseUrl, middleware) {
    middleware = middleware || function (request, next) {
        return next(request);
    };
    this.baseUrl = baseUrl;
    this.request = function (request, options) {
        request = is(request, Request) || new Request(combinePath(baseUrl, request), options);
        return middleware(request, fetchJSON);
    };
}

each('get post put patch delete', function (i, v) {
    var method = v.toUpperCase();
    defineHiddenProperty(JSONClient.prototype, v, function (path, body, options) {
        return this.request(path, v === 'get' ? body : getOptionsWithBody(method, body, options));
    });
});

export default JSONClient;
