module.exports = {
  METRIC_FAMILY: 'nodejs',
  METRIC_SOURCE: 'nodejs-collect',
  GC_TYPE: [
    null, 'Scavange', 'Mark/Sweep/Compact', null,
    'IncrementalMarking', null, null, null,
    'ProcessWeakCallbacks', null, null, null,
    null, null, null, 'All'
  ],
  DEFAULT_INTERVAL: 1000,
  DEFAULT_EVENT: {
    gc: false,
    memleak: false
  }
};
