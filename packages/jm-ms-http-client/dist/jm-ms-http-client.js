(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jm-event'), require('jm-err'), require('jm-ms-core'), require('axios'), require('http'), require('https')) :
  typeof define === 'function' && define.amd ? define(['exports', 'jm-event', 'jm-err', 'jm-ms-core', 'axios', 'http', 'https'], factory) :
  (factory((global['jm-ms-http-client'] = {}),global.jmEvent,global.jmErr,global.jmMsCore,global.axios,global.http,global.https));
}(this, (function (exports,jmEvent,jmErr,jmMsCore,axios,http,https) { 'use strict';

  jmEvent = jmEvent && jmEvent.hasOwnProperty('default') ? jmEvent['default'] : jmEvent;
  jmErr = jmErr && jmErr.hasOwnProperty('default') ? jmErr['default'] : jmErr;
  jmMsCore = jmMsCore && jmMsCore.hasOwnProperty('default') ? jmMsCore['default'] : jmMsCore;
  axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;
  http = http && http.hasOwnProperty('default') ? http['default'] : http;
  https = https && https.hasOwnProperty('default') ? https['default'] : https;

  function _awaitIgnored(value, direct) {
    if (!direct) {
      return Promise.resolve(value).then(_empty);
    }
  }

  function _empty() {}

  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }

    if (result && result.then) {
      return result.then(void 0, recover);
    }

    return result;
  }

  function _await(value, then, direct) {
    if (direct) {
      return then ? then(value) : value;
    }

    value = Promise.resolve(value);
    return then ? value.then(then) : value;
  }

  var _async = function () {
    try {
      if (isNaN.apply(null, {})) {
        return function (f) {
          return function () {
            try {
              return Promise.resolve(f.apply(this, arguments));
            } catch (e) {
              return Promise.reject(e);
            }
          };
        };
      }
    } catch (e) {}

    return function (f) {
      // Pre-ES5.1 JavaScript runtimes don't accept array-likes in Function.apply
      return function () {
        var args = [];

        for (var i = 0; i < arguments.length; i++) {
          args[i] = arguments[i];
        }

        try {
          return Promise.resolve(f.apply(this, args));
        } catch (e) {
          return Promise.reject(e);
        }
      };
    };
  }();
  var utils = jmMsCore.utils;

  var fnclient = function fnclient(_adapter) {
    return _async(function () {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (typeof opts === 'string') {
        opts = {
          uri: opts
        };
      }

      if (!opts.uri) throw jmErr.err(jmErr.Err.FA_PARAMS);
      var adapter = opts.adapter || _adapter;
      var uri = opts.uri;
      var timeout = opts.timeout || 0;
      var doc = {
        request: _async(function (opts) {
          var _this = this,
              _arguments = arguments;

          opts = utils.preRequest.apply(_this, _arguments);
          var headers = opts.headers || {};
          var noHeaders = ['host', 'if-none-match', 'content-type', 'content-length', 'connection'];
          noHeaders.forEach(function (key) {
            if (headers[key]) delete headers[key];
          });

          if (opts.ips) {
            headers['x-forwarded-for'] = opts.ips.toString();
          }

          if (opts.lng) {
            headers['lng'] = opts.lng;
          }

          var _opts = {
            method: opts.type || 'get',
            timeout: opts.timeout || timeout,
            headers: headers
          };
          var url = uri + opts.uri;
          return _catch(function () {
            return _await(adapter.request(url, opts.data, _opts), function (doc) {
              var data = doc.data;

              if (data && data.err) {
                var e = jmErr.err(data);
                throw e;
              }

              return data;
            });
          }, function (e) {
            var data = null;
            e.response && e.response.data && (data = e.response.data);

            if (data && data.err) {
              var _e = jmErr.err(data);

              throw _e;
            }

            data && (e.data = data);
            throw e;
          });
        }),
        notify: _async(function (opts) {
          var _this2 = this,
              _arguments2 = arguments;

          return _awaitIgnored(_this2.request.apply(_this2, _arguments2));
        }),
        onReady: function onReady() {
          return true;
        }
      };
      jmEvent.enableEvent(doc);
      return doc;
    });
  };

  var fnclient_1 = fnclient;

  var mdl = function mdl(adapter) {
    var client = fnclient_1(adapter);

    var $ = function $() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'ms-http-client';
      var app = this;
      app.clientModules.http = client;
      app.clientModules.https = client;
      return {
        name: name,
        unuse: function unuse() {
          delete app.clientModules.http;
          delete app.clientModules.https;
        }
      };
    };

    $.client = client;
    return $;
  };

  var _async$1 = function () {
    try {
      if (isNaN.apply(null, {})) {
        return function (f) {
          return function () {
            try {
              return Promise.resolve(f.apply(this, arguments));
            } catch (e) {
              return Promise.reject(e);
            }
          };
        };
      }
    } catch (e) {}

    return function (f) {
      // Pre-ES5.1 JavaScript runtimes don't accept array-likes in Function.apply
      return function () {
        var args = [];

        for (var i = 0; i < arguments.length; i++) {
          args[i] = arguments[i];
        }

        try {
          return Promise.resolve(f.apply(this, args));
        } catch (e) {
          return Promise.reject(e);
        }
      };
    };
  }();
  var httpAgent = new http.Agent({
    keepAlive: true
  });
  var httpsAgent = new https.Agent({
    keepAlive: true
  }); // axios 比 flyio 快3倍, 所以服务器端选用 axios

  var adapter = {
    request: _async$1(function (url, data, opts) {
      var o = Object.assign({
        url: url,
        httpAgent: httpAgent,
        httpsAgent: httpsAgent
      }, opts);

      if (data) {
        var method = o.method;

        if (method === 'post' || method === 'put' || method === 'patch') {
          o.data = data;
        } else {
          o.params = data;
        }
      }

      return axios(o);
    })
  };
  var $ = mdl(adapter);
  $.createModule = mdl; // deprecated

  var lib = $;

  exports.default = lib;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=jm-ms-http-client.js.map
