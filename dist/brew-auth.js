/*! @misonou/brew-extension-auth v0.6.1 | (c) misonou | https://misonou.pages.dev/brew-extension-auth */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("brew-js"), require("zeta-dom"));
	else if(typeof define === 'function' && define.amd)
		define("@misonou/brew-extension-auth", ["brew-js", "zeta-dom"], factory);
	else if(typeof exports === 'object')
		exports["@misonou/brew-extension-auth"] = factory(require("brew-js"), require("zeta-dom"));
	else
		root["brew"] = root["brew"] || {}, root["brew"]["Auth"] = factory(root["brew"], root["zeta"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE__760__, __WEBPACK_EXTERNAL_MODULE__231__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 231:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__231__;

/***/ }),

/***/ 760:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__760__;

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
  missingCredential: function() { return missingCredential; },
  noProvider: function() { return noProvider; },
  userNotLoggedIn: function() { return userNotLoggedIn; }
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
;// ./|umd|/brew-js/app.js

var addExtension = external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_.addExtension;

;// ./|umd|/brew-js/util/path.js

var combinePath = external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_.combinePath;

// EXTERNAL MODULE: external {"commonjs":"zeta-dom","commonjs2":"zeta-dom","amd":"zeta-dom","root":"zeta"}
var external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_ = __webpack_require__(231);
;// ./|umd|/zeta-dom/util.js

var _lib$util = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_.util,
  always = _lib$util.always,
  catchAsync = _lib$util.catchAsync,
  defineHiddenProperty = _lib$util.defineHiddenProperty,
  defineObservableProperty = _lib$util.defineObservableProperty,
  each = _lib$util.each,
  errorWithCode = _lib$util.errorWithCode,
  exclude = _lib$util.exclude,
  extend = _lib$util.extend,
  is = _lib$util.is,
  isError = _lib$util.isError,
  isErrorWithCode = _lib$util.isErrorWithCode,
  isFunction = _lib$util.isFunction,
  makeArray = _lib$util.makeArray,
  makeAsync = _lib$util.makeAsync,
  map = _lib$util.map,
  mapRemove = _lib$util.mapRemove,
  noop = _lib$util.noop,
  pick = _lib$util.pick,
  pipe = _lib$util.pipe,
  reject = _lib$util.reject,
  resolve = _lib$util.resolve,
  resolveAll = _lib$util.resolveAll,
  _throws = _lib$util["throws"];

;// ./|umd|/zeta-dom/dom.js

var reportError = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_.dom.reportError;

;// ./src/errorCode.js
var loggedIn = 'brew/auth-logged-in';
var noProvider = 'brew/auth-no-provider';
var userNotLoggedIn = 'brew/auth-user-not-logged-in';
var missingCredential = 'brew/auth-missing-credential';
var invalidCredential = 'brew/auth-invalid-credential';
;// ./src/extension.js





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
  var refreshLocks = {};
  var initPromise;
  var currentProvider;
  var currentResult;
  function initProvider(provider) {
    var context = {
      interaction: providerParams.interaction,
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
  function callProviderGuarded() {
    var fn = callProviderGuarded.call.apply(callProviderGuarded.bind, arguments);
    if (initPromise) {
      return initPromise.then(function () {
        return fn();
      });
    }
    return makeAsync(fn)();
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
        return provider && callProviderGuarded(provider.isHandleable, provider, params.loginHint).then(function (v) {
          return v ? provider : next(index + 1);
        });
      });
    }
    if (!matched[1]) {
      return matched[0];
    }
  }
  function getCacheableState() {
    return currentProvider && {
      provider: currentProvider.key,
      accountId: currentResult.accountId
    };
  }
  function setSessionState(provider, returnPath) {
    var before = getCacheableState();
    sessionCache.set(CACHE_KEY, {
      provider: provider,
      returnPath: returnPath,
      before: before
    });
  }
  function popSessionState() {
    var state = mapRemove(sessionCache, CACHE_KEY) || {};
    if (state.returnPath && state.provider === (currentProvider ? currentProvider.key : '')) {
      catchAsync(app.navigate(state.returnPath));
    }
    if (currentProvider) {
      sessionCache.set(CACHE_KEY, getCacheableState());
      currentProvider.setActiveAccount(currentResult, contexts.get(currentProvider));
    }
  }
  function setCurrentResult(provider, result) {
    var previous = getCacheableState() || previousState.before || previousState;
    var previousProvider = previous.provider && findProvider(previous);
    if (previousProvider && provider !== previousProvider) {
      previousProvider.setActiveAccount(null, contexts.get(previousProvider));
    }
    currentProvider = provider;
    currentResult = result;
    return previous;
  }
  function isCurrent(provider, result) {
    return provider && provider === currentProvider && result.accountId === currentResult.accountId;
  }
  function getAuthResult(provider, result) {
    return {
      provider: provider.key,
      providerType: provider.providerType,
      account: result.account,
      accountId: result.accountId,
      username: result.username || result.accountId,
      name: result.name || result.username || result.accountId,
      email: result.email || null,
      avatarUrl: result.avatarUrl || null
    };
  }
  function resolveUser(provider, result) {
    if (!options.resolveUser) {
      return resolve(result.account);
    }
    return makeAsync(options.resolveUser)(getAuthResult(provider, result));
  }
  function handleLogin(provider, result) {
    var previousResult = currentResult;
    var previous = setCurrentResult(provider, result);
    var resumed = previous.provider === provider.key && previous.accountId === result.accountId || !previous.provider && app.readyState !== 'ready';
    return resolveUser(provider, result).then(function (user) {
      setUser(user);
      popSessionState();
      app.emit('login', {
        user: user,
        sessionResumed: resumed,
        sessionChanged: !resumed && !!previous.accountId,
        interaction: app.readyState === 'ready' ? 'user' : previousState.returnPath ? 'redirect' : 'none'
      });
      previousState = {};
    }, function (error) {
      if (previousResult) {
        currentProvider = findProvider(previousResult);
        currentResult = previousResult;
      } else {
        handleLogout();
      }
      throw error;
    });
  }
  function handleLogout() {
    var previousProvider = currentProvider;
    var user = app.user;
    setCurrentResult(null, null);
    setUser(null);
    popSessionState();
    if (user || previousState.accountId) {
      app.emit('logout', {
        user: user,
        interaction: previousProvider ? 'user' : previousState.returnPath ? 'redirect' : 'none'
      });
    }
    previousState = {};
  }
  function _acquireToken(provider, params) {
    var key = provider.key + ':' + params.accountId;
    if (!refreshLocks[key]) {
      refreshLocks[key] = callProviderGuarded(provider.refresh, provider, params, contexts.get(provider));
      always(refreshLocks[key], function (resolved, result) {
        if (resolved && isCurrent(provider, params)) {
          currentResult = result;
        }
        delete refreshLocks[key];
      });
    }
    return refreshLocks[key];
  }
  function callProvider(provider, method, params, callback) {
    var promise = callProviderGuarded(provider[method], provider, extend({}, providerParams, params), contexts.get(provider));
    promise["catch"](function () {
      sessionCache.set(CACHE_KEY, getCacheableState());
    });
    return promise.then(callback);
  }
  app.define({
    getAllAccounts: function getAllAccounts() {
      var results = providers.map(function (provider) {
        return callProviderGuarded(provider.getAllAccounts || provider.getActiveAccount, provider, contexts.get(provider)).then(function (results) {
          return makeArray(results).map(function (v) {
            return getAuthResult(provider, v);
          });
        });
      });
      return resolveAll(results, function (arr) {
        return map(arr, pipe);
      });
    },
    resolveAuthProvider: function resolveAuthProvider(params) {
      return resolve(findProvider(params)).then(function (provider) {
        return provider ? pick(provider, ['key', 'authType', 'providerType']) : null;
      });
    },
    acquireToken: function acquireToken(params) {
      var force = params === true;
      var provider, callback;
      if (params && params.provider) {
        provider = findProvider(params) || errorWithCode(noProvider);
        params = isCurrent(provider, params) ? currentResult : params;
      } else {
        callback = isFunction(params);
        provider = currentProvider;
        params = currentResult;
      }
      if (isError(provider)) {
        return reject(provider);
      }
      callback = callback || pipe;
      if (!provider) {
        return makeAsync(callback)(null, false);
      }
      if (!force && params.expiresOn > Date.now()) {
        return makeAsync(callback)(params.accessToken, true);
      }
      var throwOnError = force || params !== currentResult;
      return _acquireToken(provider, params).then(function (result) {
        return callback(result.accessToken, false);
      }, function (error) {
        return throwOnError ? _throws(error) : callback(params.accessToken, false);
      });
    },
    login: function login(params) {
      params = params || {};
      return resolve(findProvider(params)).then(function (provider) {
        if (!provider) {
          throw errorWithCode(noProvider);
        }
        if (isCurrent(provider, params)) {
          return resolve();
        }
        return always(params.accountId && _acquireToken(provider, params), function (resolved, result) {
          if (resolved && result) {
            return handleLogin(provider, result);
          }
          setSessionState(provider.key, params.returnPath || options.postLoginPath || app.path);
          return callProvider(provider, 'login', pick(params, ['accountId', 'loginHint', 'password']), handleLogin.bind(0, provider));
        });
      });
    },
    logout: function logout(params) {
      if (!currentProvider) {
        return resolve(handleLogout());
      }
      params = params || {};
      setSessionState('', params.returnPath || options.postLogoutPath || app.path);
      return callProvider(currentProvider, 'logout', pick(currentResult, ['accountId']), handleLogout);
    }
  });
  app.beforeInit(function () {
    var promise = resolveAll(providers.map(initProvider));
    initPromise = always(promise, function () {
      initPromise = null;
    });
    return promise.then(function (results) {
      var index = providers.indexOf(findProvider(previousState));
      if (!results[index]) {
        index = results.findIndex(pipe);
      }
      return index >= 0 ? handleLogin(providers[index], results[index])["catch"](reportError) : handleLogout();
    });
  });
}));
;// ./|umd|/zeta-dom/domUtil.js

var bind = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_.util.bind;

;// ./src/provider.js



var AuthProvider = {
  from: function from(key, client) {
    var storage = window.localStorage;
    var storageKey = 'brew.auth.' + key;
    var storageKeyID = storageKey + '.id';
    var currentData;
    function isAccountData(data, accountId) {
      return data && data.accountId === accountId && data;
    }
    function parseCachedData(data) {
      try {
        return makeArray(JSON.parse(data || '[]'));
      } catch (e) {
        return [];
      }
    }
    function getCachedData(accountId) {
      if (accountId !== undefined) {
        return getCachedData().find(function (v) {
          return isAccountData(v, accountId);
        });
      }
      return parseCachedData(storage[storageKey]);
    }
    function setCachedData(data, remove) {
      var cached = getCachedData();
      var pos = cached.findIndex(function (v) {
        return isAccountData(v, data.accountId);
      });
      if (!remove) {
        cached.splice(pos, +(pos >= 0), exclude(data, ['account']));
        if (isAccountData(currentData, data.accountId)) {
          currentData = data;
        }
      } else if (pos >= 0) {
        cached.splice(pos, 1);
      }
      storage[storageKey] = JSON.stringify(cached);
      return data;
    }
    return {
      key: key,
      authType: client.authType,
      providerType: client.providerType,
      init: function init(context) {
        bind(window, 'storage', function (e) {
          if (e.storageArea === storage && e.key === storageKey) {
            var newData = parseCachedData(e.newValue).map(function (v) {
              return v.accountId;
            });
            each(parseCachedData(e.oldValue), function (i, v) {
              if (newData.indexOf(v.accountId) < 0) {
                context.revokeSession(v.accountId);
              }
            });
          }
        });
        return (client.init || noop).call(client, context);
      },
      getAllAccounts: function getAllAccounts(context) {
        var promise = getCachedData().map(function (v) {
          return isAccountData(currentData, v.accountId) || catchAsync(client.refresh(v, context).then(setCachedData));
        });
        return resolveAll(promise, function (arr) {
          return arr.filter(pipe);
        });
      },
      getActiveAccount: function getActiveAccount(context) {
        var cached = getCachedData(storage[storageKeyID] || '');
        return cached && client.refresh(cached, context).then(setCachedData);
      },
      setActiveAccount: function setActiveAccount(cached) {
        if (!cached) {
          currentData = null;
          delete storage[storageKeyID];
        } else {
          currentData = cached;
          storage[storageKeyID] = cached.accountId;
        }
      },
      handleLoginRedirect: function handleLoginRedirect(context) {
        return resolve((client.handleLoginRedirect || noop).call(client, context)).then(function (v) {
          return v && setCachedData(v);
        });
      },
      login: function login(params, context) {
        return client.login(params, context).then(setCachedData);
      },
      logout: function logout(params, context) {
        var cached = isAccountData(currentData, params.accountId) || getCachedData(params.accountId);
        if (!cached) {
          return resolve();
        }
        return client.logout(cached, context).then(setCachedData.bind(0, cached, true));
      },
      refresh: function refresh(params, context) {
        var cached = isAccountData(currentData, params.accountId) || getCachedData(params.accountId);
        if (!cached) {
          return reject(errorWithCode(userNotLoggedIn));
        }
        return client.refresh(cached, context).then(setCachedData);
      },
      isHandleable: function isHandleable(loginHint) {
        return client.isHandleable(loginHint);
      }
    };
  }
};
/* harmony default export */ var provider = (AuthProvider);
;// ./src/middleware.js

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
;// ./|umd|/brew-js/util/fetch.js

var createApiClient = external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_.createApiClient;

;// ./src/util/JSONClient.js



function JSONClient(baseUrl, middleware) {
  this.baseUrl = baseUrl;
  this.request = createApiClient(baseUrl, {
    request: middleware,
    error: function error(_error) {
      if (_error.status === 401) {
        _error.code = invalidCredential;
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
/* harmony default export */ var util_JSONClient = (JSONClient);
;// ./src/util.js


;// ./src/index.js



/* harmony default export */ var src = (extension);



;// ./src/entry.js


Object.assign(src, src_namespaceObject);
/* harmony default export */ var entry = (src);
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=brew-auth.js.map