'use strict';

const os = require('os');

module.exports.sense = function () {
  return {
    system: {
      total: os.totalmem(),
      free: os.freemem()
    },
    process: process.memoryUsage()
  };
};
