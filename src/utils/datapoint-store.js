'use strict';

module.exports = class DatapointStore {
  constructor() {
    this.buffer = [];
  }

  store(metrics) {
    this.buffer = this.buffer.concat(metrics);
  }

  flush() {
    let datapointMap = aggregateDatapoints(this.buffer);
    this.buffer = extractCumulativeCounters(this.buffer);

    return categorizeDatapoints(datapointMap);
  }
};

function aggregateDatapoints(datapoints) {
  let datapointMap = {};
  for (let i = 0; i < datapoints.length; i++) {
    let key = datapoints[i].metric + datapoints[i].dimensionKey;
    if (datapointMap[key]) {
      if (datapoints[i].type === 'counter') {
        datapointMap[key].value += datapoints[i].value;
        datapointMap[key].timestamp = datapoints[i].timestamp;
      }
      else {
        datapointMap[key] = datapoints[i];
      }
    }
    else {
      datapointMap[key] = datapoints[i];
    }
  }
  return datapointMap;
}

function categorizeDatapoints(datapointMap) {
  let cumulative_counters = [];
  let gauges = [];
  let counters = [];

  for (let key in datapointMap) {
    switch (datapointMap[key].type) {
      case 'cumulative_counter':
        cumulative_counters.push(convertMetric(datapointMap[key]));
        break;
      case 'gauge':
        gauges.push(convertMetric(datapointMap[key]));
        break;
      case 'counter':
        counters.push(convertMetric(datapointMap[key]));
        break;
    }
  }

  return {
    cumulative_counters,
    gauges,
    counters
  };
}

function convertMetric(metric) {
  let converted = {
    metric: metric.metric,
    value: metric.value,
    timestamp: metric.timestamp
  };
  if (metric.dimensions) {
    converted.dimensions = metric.dimensions;
  }
  return converted;
}

function extractCumulativeCounters(metrics) {
  let cumulativeCounters = [];
  let newTimestamp = Date.now();

  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].type === 'cumulative_counter') {
      metrics[i].timestamp = newTimestamp;
      cumulativeCounters.push(metrics[i]);
    }
  }
  return cumulativeCounters;
}
