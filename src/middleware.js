'use strict';

const register = require('./register');

module.exports = {
  express: () => {
    let requestStart;

    return (req, res, next) => {
      requestStart = Date.now();

      res.once('finish', function () {
        let request = {
          status: res.statusCode,
          route: getExpressRequestPath(req.route),
          method: getExpressRequestMethod(req.route),
          time: Date.now() - requestStart,
          size: parseInt(req.get('content-length')),
          timestamp: requestStart
        };

        register.metric.http(request);
      });

      next();
    };
  },
  koa: () => {
    return async (ctx, next) => {
      let req = ctx.request;
      let res = ctx.res;
      let requestStart = Date.now();

      await next();

      let request = {
        status: res.status,
        route: req.path,
        method: req.method,
        time: Date.now() - requestStart,
        size: req.length,
        timestamp: requestStart
      };

      register.metric.http(request);
    };
  }
};

function getExpressRequestMethod(route) {
  if (route) {
    // request.route.method is provided by Expressjs 5.x/3.x
    if (route.method) {
      return route.method;
    }
    // request.route.methods is provided by Expressjs 4.x
    if (typeof route.methods === 'object') {
      let methodNames = Object.keys(route.methods);
      for (let i = 0; i < methodNames.length; i++) {
        if (route.methods[methodNames[i]] === true) {
          return methodNames[i].toUpperCase();
        }
      }
    }
  }
  return null;
}

function getExpressRequestPath(route) {
  if (route) {
    switch (typeof(route.path)) {
      case 'string':
        return route.path;
      case 'object':
        if (route.path.length > 0) {
          return route.path.join('/');
        }
        break;
    }
  }
  return null;
}
