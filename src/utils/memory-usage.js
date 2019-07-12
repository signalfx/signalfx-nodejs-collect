'use strict';

const os = require('os');

module.exports = function () {
  return {
    system: {
      total: os.totalmem(),
      free: os.freemem()
    },
    process: process.memoryUsage()
  };
};
