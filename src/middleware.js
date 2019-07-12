'use strict';

const adapters = require('./adapters');

module.exports = {
  express: cb => {
    let requestStart;

    return (req, res, next) => {
      requestStart = Date.now();

      res.once('finish', function () {
        let request = {
          status: res.statusCode,
          time: Date.now() - requestStart,
          size: req.get('content-length'),
          timestamp: requestStart
        };

        cb(adapters.http(request));
      });

      next();
    };
  }
};
