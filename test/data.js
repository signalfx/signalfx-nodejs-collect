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

module.exports.gcStats = {
  startTime: 9426055813976,
  endTime: 9426057735390,
  pause: 1921414,
  pauseMS: 1,
  gctype: 1,
  before: {
    totalHeapSize: 11354112,
    totalHeapExecutableSize: 3670016,
    usedHeapSize: 7457184,
    heapSizeLimit: 1501560832,
    totalPhysicalSize: 9725880,
    totalAvailableSize: 1488434544,
    mallocedMemory: 8192,
    peakMallocedMemory: 1186040
  },
  after: {
    totalHeapSize: 12402688,
    totalHeapExecutableSize: 3670016,
    usedHeapSize: 6485792,
    heapSizeLimit: 1501560832,
    totalPhysicalSize: 10166144,
    totalAvailableSize: 1489388528,
    mallocedMemory: 8192,
    peakMallocedMemory: 1186040
  },
  diff: {
    totalHeapSize: 1048576,
    totalHeapExecutableSize: 0,
    usedHeapSize: -971392,
    heapSizeLimit: 0,
    totalPhysicalSize: 440264,
    totalAvailableSize: 953984,
    mallocedMemory: 0,
    peakMallocedMemory: 0
  }
};

module.exports.memleakStats = {
  start: 'Fri, 29 Jun 2012 14:12:13 GMT',
  end: 'Fri, 29 Jun 2012 14:12:33 GMT',
  growth: 67984,
  reason: 'heap growth over 5 consecutive GCs (20s) - 11.67 mb/hr'
};
