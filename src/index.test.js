const express = require('express');
const { json: bodyParserJson } = require('body-parser');

const signalfx = require('signalfx');

const SignalFxCollect = require('./index');

function delay(ms) {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}

const MEASUREMENT_TICK_MS = 100;

describe('basic usage scenarios', () => {
  let endpoint;
  let receivedDatapoints;
  let server;

  beforeEach(() => {
    const app = express();
    app.use(bodyParserJson());

    receivedDatapoints = [];

    // prevent accidental leakage between test cases
    const currentReceivedDatapoints = receivedDatapoints;

    app.post('/v2/datapoint', (req, res) => {
      currentReceivedDatapoints.push(req.body);
      res.send({});
    });

    return new Promise(resolve => {
      server = app.listen(0, () => {
        endpoint = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });

  afterEach(() => {
    return new Promise(resolve => {
      server.close(resolve);
    });
  });

  test('should launch without errors', async () => {
    const client = new signalfx.IngestJson('<token>', {
      ingestEndpoint: endpoint
    });

    const collect = new SignalFxCollect({
      signalFxClient: client,
      interval: MEASUREMENT_TICK_MS
    });
    collect.start();

    await delay(MEASUREMENT_TICK_MS * 5 + MEASUREMENT_TICK_MS / 2);
    collect._stop();

    expect(receivedDatapoints.length).toBeGreaterThanOrEqual(3);
    expect(receivedDatapoints.length).toBeLessThanOrEqual(7);
  });

  test('should produce approximately correct data points', async () => {
    const client = new signalfx.IngestJson('<token>', {
      ingestEndpoint: endpoint
    });

    const collect = new SignalFxCollect({
      signalFxClient: client,
      interval: MEASUREMENT_TICK_MS
    });
    collect.start();

    await delay(MEASUREMENT_TICK_MS + MEASUREMENT_TICK_MS / 2);
    collect._stop();

    const dataPoint = receivedDatapoints[0];
    expect(dataPoint).toBeTruthy();
    expect(Object.keys(dataPoint)).toEqual(['cumulative_counter', 'gauge']);

    [
      'nodejs.memory.gc.size',
      'nodejs.memory.gc.pause',
      'nodejs.memory.gc.total',
      'nodejs.memory.gc.size',
      'nodejs.memory.gc.pause',
      'nodejs.memory.gc.total'
    ].forEach(metricName => {
      const counter = dataPoint.cumulative_counter.find(m => m.metric == metricName);
      expect(counter).toBeTruthy();
      expect(counter.value).toBeGreaterThanOrEqual(0);
      expect(counter.timestamp).toBeGreaterThan(0);
    });

    [
      'nodejs.cpu.utilization.system',
      'nodejs.cpu.utilization.user',
      'nodejs.cpu.utilization.total',
      'nodejs.memory.system.total',
      'nodejs.memory.system.free',
      'nodejs.memory.heap.total',
      'nodejs.memory.heap.used',
      'nodejs.memory.rss',
      'nodejs.event_loop.max',
      'nodejs.event_loop.min'
    ].forEach(metricName => {
      const gauge = dataPoint.gauge.find(g => g.metric == metricName);
      expect(gauge).toBeTruthy();
      expect(gauge.value).toBeGreaterThanOrEqual(0);
      expect(gauge.timestamp).toBeGreaterThan(0);
    });
  });
});
