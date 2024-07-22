/*! @misonou/brew-extension-auth v0.4.0 | (c) misonou | https://misonou.github.io */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("brew-js"), require("zeta-dom"));
	else if(typeof define === 'function' && define.amd)
		define("@misonou/brew-extension-auth", ["brew-js", "zeta-dom"], factory);
	else if(typeof exports === 'object')
		exports["Auth"] = factory(require("brew-js"), require("zeta-dom"));
	else
		root["brew"] = root["brew"] || {}, root["brew"]["Auth"] = factory(root["brew"], root["zeta"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE__760__, __WEBPACK_EXTERNAL_MODULE__231__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 760:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__760__;

/***/ }),

/***/ 231:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__231__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ entry; }
});

// NAMESPACE OBJECT: ./src/errorCode.js
var errorCode_namespaceObject = {};
__webpack_require__.r(errorCode_namespaceObject);
__webpack_require__.d(errorCode_namespaceObject, {
  invalidCredential: function() { return invalidCredential; },
  loggedIn: function() { return loggedIn; },
  noProvider: function() { return noProvider; }
});

// NAMESPACE OBJECT: ./src/index.js
var src_namespaceObject = {};
__webpack_require__.r(src_namespaceObject);
__webpack_require__.d(src_namespaceObject, {
  AuthError: function() { return errorCode_namespaceObject; },
  AuthProvider: function() { return provider; },
  JSONClient: function() { return util_JSONClient; },
  createAxiosMiddleware: function() { return createAxiosMiddleware; },
  createFetchMiddleware: function() { return createFetchMiddleware; },
  "default": function() { return src; }
});

// EXTERNAL MODULE: external {"commonjs":"brew-js","commonjs2":"brew-js","amd":"brew-js","root":"brew"}
var external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_ = __webpack_require__(760);
;// CONCATENATED MODULE: ./|umd|/brew-js/app.js

var addExtension = external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_.addExtension;

;// CONCATENATED MODULE: ./|umd|/brew-js/util/path.js

var combinePath = external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_.combinePath;

// EXTERNAL MODULE: external {"commonjs":"zeta-dom","commonjs2":"zeta-dom","amd":"zeta-dom","root":"zeta"}
var external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_ = __webpack_require__(231);
;// CONCATENATED MODULE: ./|umd|/zeta-dom/util.js

var _lib$util = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_.util,
  catchAsync = _lib$util.catchAsync,
  defineHiddenProperty = _lib$util.defineHiddenProperty,
  defineObservableProperty = _lib$util.defineObservableProperty,
  each = _lib$util.each,
  errorWithCode = _lib$util.errorWithCode,
  exclude = _lib$util.exclude,
  extend = _lib$util.extend,
  is = _lib$util.is,
  isErrorWithCode = _lib$util.isErrorWithCode,
  isFunction = _lib$util.isFunction,
  makeArray = _lib$util.makeArray,
  makeAsync = _lib$util.makeAsync,
  mapRemove = _lib$util.mapRemove,
  noop = _lib$util.noop,
  pick = _lib$util.pick,
  pipe = _lib$util.pipe,
  reject = _lib$util.reject,
  resolve = _lib$util.resolve,
  resolveAll = _lib$util.resolveAll,
  _throws = _lib$util["throws"];

;// CONCATENATED MODULE: ./|umd|/zeta-dom/dom.js

var reportError = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_.dom.reportError;

;// CONCATENATED MODULE: ./src/errorCode.js
var loggedIn = 'brew/auth-logged-in';
var noProvider = 'brew/auth-no-provider';
var invalidCredential = 'brew/auth-invalid-credential';
;// CONCATENATED MODULE: ./src/extension.js





var CACHE_KEY = 'brew.auth';
/* harmony default export */ var extension = (addExtension('auth', ['router'], function (app, options) {
  var setUser = defineObservableProperty(app, 'user', null, true);
  var providers = makeArray(options.providers || options.provider);
  var providerParams = {
    interaction: options.interaction || 'redirect'
  };
  var contexts = new Map();
  var redirectUri = combinePath(location.origin, app.toHref('/'));
  var sessionCache = app.cache;
  var previousState = sessionCache.get(CACHE_KEY) || {};
  var isNewSession = performance.navigation.type === 0;
  var currentProvider;
  var currentResult;
  function initProvider(provider) {
    var context = {
      redirectUri: redirectUri,
      revokeSession: function revokeSession(accountId) {
        if (currentProvider === provider && (!accountId || currentResult.accountId === accountId)) {
          currentProvider = null;
          if (!app.emit('sessionEnded')) {
            handleLogout();
          }
        }
      }
    };
    contexts.set(provider, context);
    return makeAsync(provider.init).call(provider, context).then(function () {
      if (isNewSession && previousState.provider === provider.key && previousState.returnPath) {
        return provider.handleLoginRedirect(context);
      }
    }).then(function (result) {
      return result || provider.getActiveAccount(context);
    })["catch"](function (e) {
      if (!isErrorWithCode(e, invalidCredential)) {
        reportError(e);
      }
    });
  }
  function filterByProp(arr, key, value) {
    return value === undefined ? arr : arr.filter(function (v) {
      return v[key] === value;
    });
  }
  function findProvider(params) {
    if (params.provider) {
      return filterByProp(providers, 'key', params.provider)[0];
    }
    var matched = providers;
    matched = filterByProp(matched, 'authType', params.authType);
    matched = filterByProp(matched, 'providerType', params.providerType);
    if (params.loginHint) {
      return resolve(0).then(function next(index) {
        var provider = matched[index];
        return provider && resolve(provider.isHandleable(params.loginHint)).then(function (v) {
          return v ? provider : next(index + 1);
        });
      });
    }
    if (!matched[1]) {
      return matched[0];
    }
  }
  function setSessionState(provider, returnPath) {
    sessionCache.set(CACHE_KEY, {
      provider: provider,
      returnPath: returnPath
    });
  }
  function popSessionState(provider, accountId) {
    var state = mapRemove(sessionCache, CACHE_KEY) || {};
    if (state.provider === provider && state.returnPath) {
      catchAsync(app.navigate(state.returnPath));
    }
    if (provider) {
      sessionCache.set(CACHE_KEY, {
        provider: provider,
        accountId: accountId
      });
    }
  }
  function handleLogin(provider, result) {
    var resumed = previousState.provider === provider.key && previousState.accountId === result.accountId;
    var data = {
      provider: provider.key,
      providerType: provider.providerType,
      account: result.account
    };
    currentProvider = provider;
    currentResult = result;
    return (options.resolveUser ? makeAsync(options.resolveUser)(data) : resolve(data.account)).then(function (user) {
      setUser(user);
      popSessionState(provider.key, result.accountId);
      app.emit('login', {
        user: user,
        sessionResumed: resumed,
        sessionChanged: !resumed && !!previousState.accountId
      });
      previousState = {};
    }, function (error) {
      handleLogout();
      throw error;
    });
  }
  function handleLogout() {
    var user = app.user;
    currentProvider = null;
    currentResult = null;
    setUser(null);
    popSessionState('');
    if (user || previousState.accountId) {
      app.emit('logout', {
        user: user
      });
    }
    previousState = {};
  }
  function callProvider(provider, method, params, callback) {
    var promise = makeAsync(provider[method]).call(provider, extend({}, providerParams, params), contexts.get(provider));
    promise["catch"](function () {
      sessionCache["delete"](CACHE_KEY);
    });
    return promise.then(callback);
  }
  app.define({
    resolveAuthProvider: function resolveAuthProvider(params) {
      return resolve(findProvider(params)).then(function (provider) {
        return provider ? pick(provider, ['key', 'authType', 'providerType']) : null;
      });
    },
    acquireToken: function acquireToken(callback) {
      var provider = currentProvider;
      var result = currentResult;
      var force = callback === true;
      callback = isFunction(callback) || resolve;
      if (!provider) {
        return callback(null, false);
      }
      if (!force && currentResult.expiresOn > Date.now()) {
        return callback(currentResult.accessToken, true);
      }
      return provider.refresh(currentResult, contexts.get(provider)).then(function (result) {
        if (currentProvider === provider) {
          currentResult = result;
        }
        return callback(result.accessToken, false);
      }, function (error) {
        return force ? _throws(error) : callback(result.accessToken, false);
      });
    },
    login: function login(params) {
      if (currentProvider) {
        return reject(errorWithCode(loggedIn));
      }
      params = params || {};
      return resolve(findProvider(params)).then(function (provider) {
        if (!provider) {
          throw errorWithCode(noProvider);
        }
        setSessionState(provider.key, params.returnPath || options.postLoginPath || app.path);
        return callProvider(provider, 'login', pick(params, ['loginHint', 'password']), handleLogin.bind(0, provider));
      });
    },
    logout: function logout(params) {
      if (!currentProvider) {
        return resolve(handleLogout());
      }
      params = params || {};
      setSessionState('', params.returnPath || options.postLogoutPath || app.path);
      return callProvider(currentProvider, 'logout', {
        accountId: currentResult.accountId,
        singleLogout: params.singleLogout
      }, handleLogout);
    }
  });
  app.beforeInit(function () {
    return resolveAll(providers.map(initProvider), function (results) {
      var index = providers.indexOf(findProvider(previousState));
      if (!results[index]) {
        index = results.findIndex(pipe);
      }
      return index >= 0 ? handleLogin(providers[index], results[index])["catch"](reportError) : handleLogout();
    });
  });
}));
;// CONCATENATED MODULE: ./|umd|/zeta-dom/domUtil.js

var bind = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_.util.bind;

;// CONCATENATED MODULE: ./src/provider.js


var AuthProvider = {
  from: function from(key, client) {
    var storage = window.localStorage;
    var storageKey = 'brew.auth.' + key;
    var storageKeyID = storageKey + '.id';
    function getCachedData() {
      try {
        return JSON.parse(storage[storageKey]);
      } catch (e) {}
    }
    function setCurrentData(data) {
      if (data) {
        storage[storageKey] = JSON.stringify(exclude(data, ['account']));
        storage[storageKeyID] = data.accountId;
      } else {
        delete storage[storageKey];
        delete storage[storageKeyID];
      }
      return data;
    }
    return {
      key: key,
      authType: client.authType,
      providerType: client.providerType,
      init: function init(context) {
        bind(window, 'storage', function (e) {
          if (e.storageArea === storage && (e.key === storageKeyID && e.oldValue || e.key === null)) {
            context.revokeSession(e.oldValue);
          }
        });
        return (client.init || noop).call(client, context);
      },
      getActiveAccount: function getActiveAccount(context) {
        var cached = getCachedData();
        return cached && client.refresh(cached, context).then(setCurrentData);
      },
      handleLoginRedirect: function handleLoginRedirect(context) {
        return resolve((client.handleLoginRedirect || noop).call(client, context)).then(setCurrentData);
      },
      login: function login(params, context) {
        return client.login(params, context).then(setCurrentData);
      },
      logout: function logout(params, context) {
        return client.logout(params, context).then(setCurrentData.bind(0, undefined));
      },
      refresh: function refresh(cached, context) {
        return client.refresh(cached, context).then(setCurrentData);
      },
      isHandleable: function isHandleable(loginHint) {
        return client.isHandleable(loginHint);
      }
    };
  }
};
/* harmony default export */ var provider = (AuthProvider);
;// CONCATENATED MODULE: ./src/middleware.js

var HEADER_AUTHORIZATION = 'authorization';
function retryOrEnd(acquireToken, response, retryable, callback, onError) {
  return retryable && response && response.status === 401 ? acquireToken(true).then(callback, onError) : onError();
}
function fetchMiddleware(acquireToken, filter, request, next) {
  if (!is(request, Request) || next && !isFunction(next)) {
    return fetchMiddleware(acquireToken, filter, new Request(request, next));
  }
  next = next || window.fetch;
  if (filter && !filter(request) || request.headers.has(HEADER_AUTHORIZATION)) {
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
  var withBearerToken = function withBearerToken(config, accessToken) {
    config.headers[HEADER_AUTHORIZATION] = 'Bearer ' + accessToken;
    return config;
  };
  axios.interceptors.request.use(function (config) {
    if (filter && !filter(config) || config.headers[HEADER_AUTHORIZATION]) {
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
function createFetchMiddleware(app, filter) {
  return fetchMiddleware.bind(0, app.acquireToken, filter);
}
function createAxiosMiddleware(app, filter) {
  return axiosMiddleware.bind(0, app.acquireToken, filter);
}
;// CONCATENATED MODULE: ./|umd|/brew-js/errorCode.js

var errorCode = external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_.ErrorCode;
var apiError = errorCode.apiError;

;// CONCATENATED MODULE: ./src/util/JSONClient.js




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
  throw errorWithCode(response.status === 401 ? invalidCredential : apiError, '', {
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
/* harmony default export */ var util_JSONClient = (JSONClient);
;// CONCATENATED MODULE: ./src/util.js


;// CONCATENATED MODULE: ./src/index.js



/* harmony default export */ var src = (extension);



;// CONCATENATED MODULE: ./src/entry.js


Object.assign(src, src_namespaceObject);
/* harmony default export */ var entry = (src);
}();
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=brew-auth.js.map