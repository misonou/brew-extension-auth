/*! @misonou/brew-extension-auth v0.5.0 | (c) misonou | https://misonou.github.io */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@azure/msal-browser"), require("brew-js"), require("zeta-dom"));
	else if(typeof define === 'function' && define.amd)
		define("@misonou/brew-extension-auth/msal", ["@azure/msal-browser", "brew-js", "zeta-dom"], factory);
	else if(typeof exports === 'object')
		exports["@misonou/brew-extension-auth/msal"] = factory(require("@azure/msal-browser"), require("brew-js"), require("zeta-dom"));
	else
		root["brew"] = root["brew"] || {}, root["brew"]["Auth"] = root["brew"]["Auth"] || {}, root["brew"]["Auth"]["MsalAuthProvider"] = factory(root["msal"], root["brew"], root["zeta"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE__735__, __WEBPACK_EXTERNAL_MODULE__760__, __WEBPACK_EXTERNAL_MODULE__231__) {
return /******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 231:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__231__;

/***/ }),

/***/ 735:
/***/ (function(module) {

module.exports = __WEBPACK_EXTERNAL_MODULE__735__;

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
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ msal; }
});

// EXTERNAL MODULE: external {"commonjs":"@azure/msal-browser","commonjs2":"@azure/msal-browser","amd":"@azure/msal-browser","root":"msal"}
var msal_browser_root_msal_ = __webpack_require__(735);
// EXTERNAL MODULE: external {"commonjs":"brew-js","commonjs2":"brew-js","amd":"brew-js","root":"brew"}
var external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_ = __webpack_require__(760);
;// ./|umd|/brew-js/util/common.js

var getJSON = external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_.getJSON;

;// ./|umd|/brew-js/util/path.js

var isSubPathOf = external_commonjs_brew_js_commonjs2_brew_js_amd_brew_js_root_brew_.isSubPathOf;

// EXTERNAL MODULE: external {"commonjs":"zeta-dom","commonjs2":"zeta-dom","amd":"zeta-dom","root":"zeta"}
var external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_ = __webpack_require__(231);
;// ./|umd|/zeta-dom/util.js

var _lib$util = external_commonjs_zeta_dom_commonjs2_zeta_dom_amd_zeta_dom_root_zeta_.util,
  util_define = _lib$util.define,
  extend = _lib$util.extend,
  is = _lib$util.is;

;// ./src/msal.js




var AUTHORITY_URI = 'https://login.microsoftonline.com/';
var MsalAuthProvider = {};
var issuerCache = {};
var multitenant = {
  common: true,
  organizations: true
};
var defaultConfig = {
  cache: {
    cacheLocation: 'localStorage'
  }
};
function clearInteractionStatus() {
  delete sessionStorage['msal.interaction.status'];
}
function getIssuerURL(domain) {
  return issuerCache[domain] || (issuerCache[domain] = getJSON(AUTHORITY_URI + domain + '/v2.0/.well-known/openid-configuration').then(function (v) {
    return v.issuer;
  }, function (xhr) {
    if (xhr.status === 400) {
      return '';
    }
    delete issuerCache[domain];
  }));
}

/**
 * @param {string} key
 * @param {PublicClientApplication} client
 * @param {*} options
 */
function createProvider(key, client, options) {
  var scopes = options.scopes;
  function _refresh(account, context) {
    return client.acquireTokenSilent({
      redirectUri: context.redirectUri,
      account: account,
      scopes: scopes
    });
  }
  function handleResult(result) {
    if (result) {
      var account = result.account;
      client.setActiveAccount(account);
      return {
        account: account,
        accountId: account.homeAccountId,
        accessToken: result.accessToken,
        expiresOn: result.expiresOn
      };
    }
  }
  return {
    key: key,
    authType: 'federated',
    providerType: 'msal',
    isHandleable: function isHandleable(loginHint) {
      if (!/@(.+)$/.test(loginHint)) {
        return false;
      }
      var authority = client.getConfiguration().auth.authority;
      if (multitenant[authority.slice(AUTHORITY_URI.length)]) {
        return true;
      }
      return getIssuerURL(RegExp.$1).then(function (issuer) {
        return !!isSubPathOf(issuer, authority);
      });
    },
    init: function init(context) {
      client.enableAccountStorageEvents();
      client.addEventCallback(function (message) {
        if (message.eventType === msal_browser_root_msal_.EventType.ACCOUNT_REMOVED) {
          context.revokeSession(message.payload.homeAccountId);
        }
      });
      return client.initialize();
    },
    getActiveAccount: function getActiveAccount(context) {
      var account = client.getActiveAccount();
      return account && _refresh(account, context).then(handleResult, function () {
        client.setActiveAccount(null);
      });
    },
    handleLoginRedirect: function handleLoginRedirect() {
      return client.handleRedirectPromise().then(handleResult);
    },
    refresh: function refresh(current, context) {
      return _refresh(current.account, context).then(handleResult);
    },
    login: function login(params, context) {
      var request = {
        redirectUri: context.redirectUri,
        loginHint: params.loginHint,
        scopes: scopes
      };
      clearInteractionStatus();
      if (params.interaction === 'popup') {
        return client.loginPopup(request).then(handleResult);
      } else {
        return client.loginRedirect(request);
      }
    },
    logout: function logout(params, context) {
      var account = client.getAccount({
        homeAccountId: params.accountId
      });
      if (!params.singleLogout) {
        return client.clearCache({
          account: account
        });
      }
      clearInteractionStatus();
      if (params.interaction === 'popup') {
        return client.logoutPopup({
          account: account
        });
      } else {
        return client.logoutRedirect({
          account: account,
          postLogoutRedirectUri: context.redirectUri
        });
      }
    }
  };
}
util_define(MsalAuthProvider, {
  defaultConfig: defaultConfig,
  setDefault: function setDefault(config) {
    extend(true, defaultConfig, config);
  },
  create: function create(key, options, authority, scopes) {
    if (typeof options === 'string') {
      options = {
        scopes: scopes,
        config: {
          auth: {
            clientId: options,
            authority: authority
          }
        }
      };
    }
    var client = is(options, msal_browser_root_msal_.PublicClientApplication) || new msal_browser_root_msal_.PublicClientApplication(extend(true, {}, defaultConfig, options.config));
    client.getConfiguration().auth.navigateToLoginRequestUrl = false;
    return createProvider(key, client, options);
  }
});
/* harmony default export */ var msal = (MsalAuthProvider);
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=brew-auth-msal.js.map