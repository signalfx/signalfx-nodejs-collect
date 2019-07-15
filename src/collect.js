'use strict';

const eventLoopStats = require('event-loop-stats');
const gc = (require('gc-stats'))();
const memwatch = require('memwatch-next');

const cpuUsage = require('./utils/cpu-usage');
const memoryUsage = require('./utils/memory-usage');
const adapters = require('./adapters');

const emitter = new (require('events').EventEmitter)();

module.exports = {
  collect: () => {
    let metrics = [];

    let cpu = cpuUsage.sense();
    if (cpu) {
      metrics = metrics.concat(adapters.metric.cpuUsage(cpu));
    }

    let mem = memoryUsage.sense();
    if (mem) {
      metrics = metrics.concat(adapters.metric.memoryUsage(mem));
    }

    let el = eventLoopStats.sense();
    if (el) {
      metrics = metrics.concat(adapters.metric.eventLoop(el));
    }

    return metrics;
  },
  registerEvent: event => {
    switch (event) {
    case 'gc':
      gc.on('stats', stats => {
        emitter.emit('metrics', adapters.metric.gc(stats), adapters.event.gc(stats));
      });
      break;
    case 'memleak':
      memwatch.on('leak', stats => {
        emitter.emit('metrics', adapters.metric.memoryLeak(stats), adapters.event.memoryLeak(stats));
      });
      break;
    }
  },
  getEmitter: () => emitter
};
