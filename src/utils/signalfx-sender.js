'use strict';

const signalfx = require('signalfx');

module.exports = class SignalFxSender {
  constructor(token) {
    this.client = new signalfx.Ingest(token);
  }

  send(metrics) {
    if (!metrics || metrics.length == 0) {
      return;
    }

    let cumulative_counters = [];
    let gauges = [];
    let counters = [];

    for (let i = 0; i < metrics.length; i++) {
      if (!metrics[i]) {
        continue;
      }
      switch (metrics[i].type) {
      case 'cumulative_counter':
        cumulative_counters.push(convertMetric(metrics[i]));
        break;
      case 'gauge':
        gauges.push(convertMetric(metrics[i]));
        break;
      case 'counter':
        counters.push(convertMetric(metrics[i]));
        break;
      }
    }

    this.client.send({
      cumulative_counters,
      gauges,
      counters
    });
  }

  sendEvent(event) {
    event.category = this.client.EVENT_CATEGORIES.USER_DEFINED;

    this.client.sendEvent(event);
  }
};

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
