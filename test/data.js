'use strict';

module.exports.cpuUsage = {
  system: 10,
  user: 20,
  total: 30
};

module.exports.memoryUsage = {
  system: {
    free: 10,
    total: 100
  },
  process: {
    heapTotal: 100,
    heapUsed: 10,
    rss: 200
  }
};

module.exports.eventLoopStats = {
  min: 1,
  max: 10,
  total: 35
};
