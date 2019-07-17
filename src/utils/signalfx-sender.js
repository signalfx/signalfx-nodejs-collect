'use strict';

const signalfx = require('signalfx');
const DatapointStore = require('./datapoint-store');

module.exports = class SignalFxSender {
  constructor(auth, interval) {
    if (auth.client) {
      this.client = auth.client;
    }
    else {
      this.client = new signalfx.Ingest(auth.accessToken);
    }
    this.interval = interval;
    this.datapointStore = new DatapointStore();

    this._startReportLoop(interval);
  }

  sendMetrics(metrics) {
    this.datapointStore.store(metrics);
  }

  sendEvent(event) {
    event.category = this.client.EVENT_CATEGORIES.USER_DEFINED;

    this.client.sendEvent(event);
  }

  _startReportLoop(interval) {
    setInterval(() => {
      this.client.send(this.datapointStore.flush());
    }, interval);
  }
};
