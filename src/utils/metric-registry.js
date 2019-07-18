'use strict';

class Metric {
  constructor(type, metric, dimensions) {
    this.type = type;
    this.metric = metric;
    this.dimensions = dimensions;
  }

  get() {
    return createMetricObject(this.type, this.metric, this.value, this.timestamp, this.dimensions);
  }
}

class Gauge extends Metric {
  constructor(metric, dimensions) {
    super('gauge', metric, dimensions);
  }

  set(value, timestamp) {
    this.value = value;
    this.timestamp = timestamp;
    return this;
  }
}

class Cumulative extends Metric {
  constructor(metric, dimensions) {
    super('cumulative_counter', metric, dimensions);
    this.value = 0;
  }

  increment(value, timestamp) {
    this.value += value;
    this.timestamp = timestamp;
    return this;
  }
}

module.exports = class MetricRegistry {
  constructor() {
    this.metrics = {};
  }

  getGauge(metric, dimensions, dimensionsKey) {
    let key = metric + dimensionsKey;
    if (!this.metrics[metric + dimensionsKey]) {
      this.metrics[key] = new Gauge(metric, dimensions);
    }
    return this.metrics[key];
  }

  getCumulative(metric, dimensions, dimensionsKey) {
    let key = metric + dimensionsKey;
    if (!this.metrics[metric + dimensionsKey]) {
      this.metrics[key] = new Cumulative(metric, dimensions);
    }
    return this.metrics[key];
  }

  export() {
    let metricObjects = [];

    for (let key in this.metrics) {
      metricObjects.push(this.metrics[key].get());
    }

    return metricObjects;
  }

  flush() {
    let cumulatives = {};
    for (let key in this.metrics) {
      if (this.metrics[key].type === 'cumulative_counter') {
        cumulatives[key] = this.metrics[key];
      }
    }
    this.metrics = cumulatives;
  }
};

function createMetricObject(type, metric, value, timestamp, dimensions) {
  let obj = {
    type,
    metric,
    value,
    timestamp
  };
  if (dimensions) {
    obj.dimensions = dimensions;
  }
  return obj;
}
