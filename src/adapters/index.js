'use strict';

const { METRIC_FAMILY, GC_TYPE } = require('../common/constants');
const { getMetricObject, getBasicDimensions } = require('../common/helpers');

let basicDimensions = getBasicDimensions();

module.exports.metric = {
  cpuUsage: usage => {
    const prefix = `${METRIC_FAMILY}.cpu.utilization`;
    const timestamp = Date.now();
    return [
      getMetricObject('gauge', `${prefix}.system`, usage.system, timestamp, basicDimensions),
      getMetricObject('gauge', `${prefix}.user`, usage.user, timestamp, basicDimensions),
      getMetricObject('gauge', `${prefix}.total`, usage.total, timestamp, basicDimensions)
    ];
  },
  memoryUsage: usage => {
    const prefix = `${METRIC_FAMILY}.memory`;
    const timestamp = Date.now();
    return [
      getMetricObject('gauge', `${prefix}.system.total`, usage.system.total, timestamp, basicDimensions),
      getMetricObject('gauge', `${prefix}.system.free`, usage.system.free, timestamp, basicDimensions),
      getMetricObject('gauge', `${prefix}.heap.total`, usage.process.heapTotal, timestamp, basicDimensions),
      getMetricObject('gauge', `${prefix}.heap.used`, usage.process.heapUsed, timestamp, basicDimensions),
      getMetricObject('gauge', `${prefix}.rss`, usage.process.rss, timestamp, basicDimensions)
    ];
  },
  eventLoop: stats => {
    const prefix = `${METRIC_FAMILY}.event_loop`;
    const timestamp = Date.now();
    return [
      getMetricObject('gauge', `${prefix}.max`, stats.max, timestamp, basicDimensions),
      getMetricObject('gauge', `${prefix}.min`, stats.min, timestamp, basicDimensions)
    ];
  },
  gc: stats => {
    const prefix = `${METRIC_FAMILY}.memory.gc`;
    // gc-stats provides startTime but it is in node process.hrtime() so can't use.
    const timestamp = Date.now();
    const dimensions = Object.assign({}, basicDimensions, {
      gctype: GC_TYPE[stats.gctype]
    });
    return [
      getMetricObject('gauge', `${prefix}.size`, stats.diff.totalHeapSize, timestamp, dimensions),
      getMetricObject('gauge', `${prefix}.pause`, stats.pause, timestamp, dimensions)
    ];
  },
  memoryLeak: stats => {
    return [
      getMetricObject('gauge', `${METRIC_FAMILY}.memory.heap.leak`, stats.growth, Date.now(), basicDimensions)
    ];
  },
  http: request => {
    const prefix = `${METRIC_FAMILY}.http`;
    const dimensions = Object.assign({}, basicDimensions, {
      method: request.method ? request.method : 'unknown',
      route: request.route ? request.route : 'unknown'
    });
    return [
      getMetricObject('counter', `${prefix}.rq_total`, 1, request.timestamp, dimensions),
      getMetricObject('gauge', `${prefix}.rq_time`, request.time, request.timestamp, dimensions),
      getMetricObject('counter', `${prefix}.rq_${request.status}`, 1, request.timestamp, dimensions),
      getMetricObject('gauge', `${prefix}.rq_size`, request.size, request.timestamp, dimensions)
    ];
  }
};

module.exports.event = {
  gc: stats => {
    let eventObj = {
      event: 'gc',
      eventType: 'Garbage Collection happened',
      properties: {
        'size': stats.diff.totalHeapSize,
        'pause': stats.pause
      },
      dimensions: basicDimensions,
      timestamp: Date.now()
    };
    return eventObj;
  },
  memoryLeak: stats => {
    let eventObj = {
      event: 'memleak',
      eventType: stats.reason,
      properties: {
        'size': stats.growth
      },
      dimensions: basicDimensions,
      timestamp: Date.now()
    };
    return eventObj;
  }
};

module.exports.addBasicDimensions = dimensions => {
  Object.assign(basicDimensions, dimensions);
};