'use strict';

const signalfx = require('signalfx');

const { LOG_LEVEL } = require('../common/constants');
const metricRegistry = require('../register').getRegistry();

module.exports = class SignalFxSender {
  constructor(config) {
    validateConfig(config);

    if (config.client) {
      this.client = config.client;
    }
    else {
      let options = {};
      if (config.ingestEndpoint) {
        options.ingestEndpoint = config.ingestEndpoint;
      }
      this.client = new signalfx.Ingest(config.accessToken, options);
    }
    this.interval = config.interval;
    if (config.logLevel) {
      this.logLevel = config.logLevel;
    }

    this._startReportLoop(config.interval);

    if (this.logLevel <= LOG_LEVEL.INFO) {
      console.debug('Start reporting to SignalFx Node.js Client');
    }
    if (this.logLevel <= LOG_LEVEL.DEBUG) {
      console.debug(this.client);
    }
  }

  sendEvent(event) {
    event.category = this.client.EVENT_CATEGORIES.USER_DEFINED;

    this.client.sendEvent(event);
  }

  _startReportLoop(interval) {
    setInterval(() => {
      let datapoints = metricRegistry.export();
      this.client.send(categorizeDatapoints(datapoints));
      metricRegistry.flush();
      
      if (this.logLevel <= LOG_LEVEL.INFO) {
        console.debug(`Reported ${datapoints.length} datapoints to SignalFx Node.js Client`);
      }
      if (this.logLevel <= LOG_LEVEL.DEBUG) {
        console.debug(datapoints);
      }
    }, interval);
  }
};

function validateConfig(config) {
  if (!config) {
    throw 'SignalFxSender requires a config object';
  }
}

function categorizeDatapoints(datapoints) {
  let cumulative_counters = [];
  let gauges = [];
  let counters = [];

  for (let i = 0; i < datapoints.length; i++) {
    switch (datapoints[i].type) {
    case 'cumulative_counter':
      cumulative_counters.push(convertMetric(datapoints[i]));
      break;
    case 'gauge':
      gauges.push(convertMetric(datapoints[i]));
      break;
    case 'counter':
      counters.push(convertMetric(datapoints[i]));
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
    converted.dimensions = filterDimensions(metric.dimensions);
  }
  return converted;
}

function filterDimensions(dimensions) {
  const filtered = {};
  for (const key in dimensions) {
    if (typeof(dimensions[key]) == 'string') {
      filtered[key] = dimensions[key];
    }
  }
  return filtered;
}
