'use strict';

const fqdn = require('fqdn');
const { METRIC_SOURCE } = require('./constants');

module.exports.getBasicDimensions = () => {
  return {
    host: fqdn(),
    metric_source: METRIC_SOURCE
  };
};
