'use strict';

const { METRIC_FAMILY, GC_TYPE } = require('./common/constants');
const { getBasicDimensions } = require('./common/helpers');

let basicDimensions = getBasicDimensions();
let MetricRegistry = require('./utils/metric-registry');
let metricRegistry = new MetricRegistry();

module.exports.metric = {
  cpuUsage: usage => {
    const prefix = `${METRIC_FAMILY}.cpu.utilization`;
    const timestamp = Date.now();

    metricRegistry.getGauge(`${prefix}.system`, basicDimensions, '').set(usage.system, timestamp);
    metricRegistry.getGauge(`${prefix}.user`, basicDimensions, '').set(usage.user, timestamp);
    metricRegistry.getGauge(`${prefix}.total`, basicDimensions, '').set(usage.total, timestamp);
  },
  memoryUsage: usage => {
    const prefix = `${METRIC_FAMILY}.memory`;
    const timestamp = Date.now();

    metricRegistry.getGauge(`${prefix}.system.total`, basicDimensions, '').set(usage.system.total, timestamp);
    metricRegistry.getGauge(`${prefix}.system.free`, basicDimensions, '').set(usage.system.free, timestamp);
    metricRegistry.getGauge(`${prefix}.heap.total`, basicDimensions, '').set(usage.process.heapTotal, timestamp);
    metricRegistry.getGauge(`${prefix}.heap.used`, basicDimensions, '').set(usage.process.heapUsed, timestamp);
    metricRegistry.getGauge(`${prefix}.rss`, basicDimensions, '').set(usage.process.rss, timestamp);
  },
  eventLoop: stats => {
    const prefix = `${METRIC_FAMILY}.event_loop`;
    const timestamp = Date.now();

    metricRegistry.getGauge(`${prefix}.max`, basicDimensions, '').set(stats.max, timestamp);
    metricRegistry.getGauge(`${prefix}.min`, basicDimensions, '').set(stats.min, timestamp);
  },
  gc: stats => {
    const prefix = `${METRIC_FAMILY}.memory.gc`;
    // gc-stats provides startTime but it is in node process.hrtime() so can't use.
    const timestamp = Date.now();
    const dimensions = Object.assign({}, basicDimensions, {
      gctype: GC_TYPE[stats.gctype]
    });

    metricRegistry.getCumulative(`${prefix}.size`, dimensions, stats.gctype).increment(stats.diff.usedHeapSize * -1, timestamp);
    metricRegistry.getCumulative(`${prefix}.pause`, dimensions, stats.gctype).increment(stats.pause, timestamp);
    metricRegistry.getCumulative(`${prefix}.total`, dimensions, stats.gctype).increment(1, timestamp);
  },
  memoryLeak: stats => {
    metricRegistry.getCumulative(`${METRIC_FAMILY}.memory.heap.leak`, basicDimensions, stats.gctype).increment(stats.growth, Date.now());
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

    metricRegistry.getCumulative(`${prefix}.rq_total`, dimensions, dimensionKey).increment(1, request.timestamp);
    metricRegistry.getGauge(`${prefix}.rq_time`, basicDimensions, '').set(request.time, request.timestamp);
    metricRegistry.getCumulative(`${prefix}.rq_${request.status}`, dimensions, dimensionKey).increment(1, request.timestamp);
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

module.exports.getRegistry = () => {
  return metricRegistry;
};

module.exports.addBasicDimensions = dimensions => {
  Object.assign(basicDimensions, dimensions);
};
