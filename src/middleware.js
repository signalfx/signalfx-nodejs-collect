'use strict';

const adapters = require('./adapters');

module.exports = {
  express: report => {
    let requestStart;

    return (req, res, next) => {
      requestStart = Date.now();

      res.once('finish', function () {
        let request = {
          status: res.statusCode,
          route: req.route ? req.route.path : null,
          method: getExpressRequestMethod(req.route),
          time: Date.now() - requestStart,
          size: req.get('content-length'),
          timestamp: requestStart
        };

        report(adapters.metric.http(request));
      });

      next();
    };
  },
  koa: report => {
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

      report(adapters.metric.http(request));
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
