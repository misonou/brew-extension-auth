import { is, isFunction, mapRemove, reject } from "zeta-dom/util";

function retryOrEnd(acquireToken, response, retryable, callback, onError) {
    return retryable && response && response.status === 401 ? acquireToken(true).then(callback, onError) : onError();
}

function fetchMiddleware(acquireToken, request, next) {
    if (!is(request, Request) || (next && !isFunction(next))) {
        return fetchMiddleware(acquireToken, new Request(request, next));
    }
    next = next || window.fetch;
    return acquireToken(function execute(accessToken, retryable) {
        var req = request;
        if (accessToken) {
            req = req.clone();
            req.headers.set('authorization', 'Bearer ' + accessToken);
        }
        return next(req).then(function (response) {
            return retryOrEnd(acquireToken, response, retryable, execute, function () {
                return response;
            });
        });
    });
}

function axiosMiddleware(acquireToken, axios) {
    var handled = new WeakMap();
    var withBearerToken = function (config, accessToken) {
        config.headers.authorization = 'Bearer ' + accessToken;
        return config;
    };
    axios.interceptors.request.use(function (config) {
        if (mapRemove(handled, config)) {
            // refreshed access token is already set in error interceptors
            // flag is removed from map to avoid recursion
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
            return axios(withBearerToken(error.config, accessToken));
        }, function () {
            return reject(error);
        });
    });
    return axios;
}

export function createFetchMiddleware(app) {
    return fetchMiddleware.bind(0, app.acquireToken);
}

export function createAxiosMiddleware(app) {
    return axiosMiddleware.bind(0, app.acquireToken);
}
