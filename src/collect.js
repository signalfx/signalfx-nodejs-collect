'use strict';

const eventLoopStats = require('event-loop-stats');
const gc = (require('gc-stats'))();
const memwatch = require('memwatch-next');

const cpuUsage = require('./utils/cpu-usage');
const memoryUsage = require('./utils/memory-usage');
const register = require('./register');

const emitter = new (require('events').EventEmitter)();

module.exports = {
  collect: () => {
    let cpu = cpuUsage.get();
    if (cpu) {
      register.metric.cpuUsage(cpu);
    }

    let mem = memoryUsage.get();
    if (mem) {
      register.metric.memoryUsage(mem);
    }

    let el = eventLoopStats.sense();
    if (el) {
      register.metric.eventLoop(el);
    }
  },
  registerEvent: event => {
    switch (event) {
    case 'gc':
      gc.on('stats', stats => {
        emitter.emit('metrics', register.metric.gc(stats), register.event.gc(stats));
      });
      break;
    case 'memleak':
      memwatch.on('leak', stats => {
        emitter.emit('metrics', register.metric.memoryLeak(stats), register.event.memoryLeak(stats));
      });
      break;
    }
  },
  getEmitter: () => emitter
};
