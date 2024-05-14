import { is, isFunction, reject } from "zeta-dom/util";

const HEADER_AUTHORIZATION = 'authorization';

function retryOrEnd(acquireToken, response, retryable, callback, onError) {
    return retryable && response && response.status === 401 ? acquireToken(true).then(callback, onError) : onError();
}

function fetchMiddleware(acquireToken, filter, request, next) {
    if (!is(request, Request) || (next && !isFunction(next))) {
        return fetchMiddleware(acquireToken, filter, new Request(request, next));
    }
    next = next || window.fetch;
    if ((filter && !filter(request)) || request.headers.has(HEADER_AUTHORIZATION)) {
        return next(request);
    }
    return acquireToken(function execute(accessToken, retryable) {
        var req = request;
        if (accessToken) {
            req = req.clone();
            req.headers.set(HEADER_AUTHORIZATION, 'Bearer ' + accessToken);
        }
        return next(req).then(function (response) {
            return retryOrEnd(acquireToken, response, retryable, execute, function () {
                return response;
            });
        });
    });
}

function axiosMiddleware(acquireToken, filter, axios) {
    var handled = new WeakMap();
    var withBearerToken = function (config, accessToken) {
        config.headers[HEADER_AUTHORIZATION] = 'Bearer ' + accessToken;
        return config;
    };
    axios.interceptors.request.use(function (config) {
        if ((filter && !filter(config)) || config.headers[HEADER_AUTHORIZATION]) {
            return config;
        }
        return acquireToken(function (accessToken, retryable) {
            handled.set(config, retryable);
            return accessToken ? withBearerToken(config, accessToken) : config;
        });
    });
    axios.interceptors.response.use(undefined, function (error) {
        error = error || {};
        return retryOrEnd(acquireToken, error.response, handled.get(error.config), function (accessToken) {
            return axios.create()(withBearerToken(error.config, accessToken));
        }, function () {
            return reject(error);
        });
    });
    return axios;
}

export function createFetchMiddleware(app, filter) {
    return fetchMiddleware.bind(0, app.acquireToken, filter);
}

export function createAxiosMiddleware(app, filter) {
    return axiosMiddleware.bind(0, app.acquireToken, filter);
}
