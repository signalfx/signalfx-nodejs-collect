'use strict';

const fqdn = require('fqdn');
const { METRIC_SOURCE } = require('./constants');

let cumulativeValues = {};

module.exports.createMetricObject = (type, metric, value, timestamp, dimensions, dimensionKey) => {
  if (type === 'cumulative_counter') {
    let key = metric + dimensionKey;
    if (!cumulativeValues[key]) {
      cumulativeValues[key] = 0;
    }

    cumulativeValues[key] += value;
    value = cumulativeValues[key];
  }

  let obj = {
    type,
    metric,
    value,
    timestamp,
    dimensionKey: dimensionKey ? dimensionKey : ''
  };
  if (dimensions) {
    obj.dimensions = dimensions;
  }
  return obj;
};

module.exports.getBasicDimensions = () => {
  return {
    host: fqdn(),
    metric_source: METRIC_SOURCE
  };
};
