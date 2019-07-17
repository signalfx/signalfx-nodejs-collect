'use strict';

const { METRIC_FAMILY, GC_TYPE } = require('../common/constants');
const { createMetricObject, getBasicDimensions } = require('../common/helpers');

let basicDimensions = getBasicDimensions();

module.exports.metric = {
  cpuUsage: usage => {
    const prefix = `${METRIC_FAMILY}.cpu.utilization`;
    const timestamp = Date.now();
    return [
      createMetricObject('gauge', `${prefix}.system`, usage.system, timestamp, basicDimensions),
      createMetricObject('gauge', `${prefix}.user`, usage.user, timestamp, basicDimensions),
      createMetricObject('gauge', `${prefix}.total`, usage.total, timestamp, basicDimensions)
    ];
  },
  memoryUsage: usage => {
    const prefix = `${METRIC_FAMILY}.memory`;
    const timestamp = Date.now();
    return [
      createMetricObject('gauge', `${prefix}.system.total`, usage.system.total, timestamp, basicDimensions),
      createMetricObject('gauge', `${prefix}.system.free`, usage.system.free, timestamp, basicDimensions),
      createMetricObject('gauge', `${prefix}.heap.total`, usage.process.heapTotal, timestamp, basicDimensions),
      createMetricObject('gauge', `${prefix}.heap.used`, usage.process.heapUsed, timestamp, basicDimensions),
      createMetricObject('gauge', `${prefix}.rss`, usage.process.rss, timestamp, basicDimensions)
    ];
  },
  eventLoop: stats => {
    const prefix = `${METRIC_FAMILY}.event_loop`;
    const timestamp = Date.now();
    return [
      createMetricObject('gauge', `${prefix}.max`, stats.max, timestamp, basicDimensions),
      createMetricObject('gauge', `${prefix}.min`, stats.min, timestamp, basicDimensions)
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
      createMetricObject('cumulative_counter', `${prefix}.size`, stats.diff.usedHeapSize * -1, timestamp, dimensions, stats.gctype),
      createMetricObject('cumulative_counter', `${prefix}.pause`, stats.pause, timestamp, dimensions, stats.gctype),
      createMetricObject('cumulative_counter', `${prefix}.total`, 1, timestamp, dimensions, stats.gctype)
    ];
  },
  memoryLeak: stats => {
    return [
      createMetricObject('cumulative_counter', `${METRIC_FAMILY}.memory.heap.leak`, stats.growth, Date.now(), basicDimensions)
    ];
  },
  http: request => {
    const prefix = `${METRIC_FAMILY}.http`;
    const method = request.method ? request.method : 'unknown';
    const route = request.route ? request.route : 'unknown';
    const dimensions = Object.assign({}, basicDimensions, {
      method,
      route
    });
    const dimensionKey = `${method}${route}`;
    let metrics = [
      createMetricObject('counter', `${prefix}.rq_total`, 1, request.timestamp, dimensions, dimensionKey),
      createMetricObject('gauge', `${prefix}.rq_time`, request.time, request.timestamp, dimensions, dimensionKey),
      createMetricObject('counter', `${prefix}.rq_${request.status}`, 1, request.timestamp, dimensions, dimensionKey)
    ];
    if (request.size) {
      metrics.push(createMetricObject('gauge', `${prefix}.rq_size`, request.size, request.timestamp, dimensions));
    }
    return metrics;
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
