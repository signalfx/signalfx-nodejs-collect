'use strict';

const fqdn = require('fqdn');
const { METRIC_SOURCE } = require('./constants');

module.exports.getMetricObject = (type, metric, value, timestamp, dimensions) => {
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
};

module.exports.getBasicDimensions = () => {
  return {
    host: fqdn(),
    metric_source: METRIC_SOURCE
  };
};
