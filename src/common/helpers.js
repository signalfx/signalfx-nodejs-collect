'use strict';

const fqdn = require('fqdn');
const { METRIC_SOURCE } = require('./constants');
let node_version;

if (process.versions) {
  node_version = process.versions.node;
}
else {
  node_version = 'unknown';
}


module.exports.getBasicDimensions = () => {
  return {
    host: fqdn(),
    metric_source: METRIC_SOURCE,
    node_version
  };
};
