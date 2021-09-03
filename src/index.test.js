const express = require('express');
const signalfx = require('signalfx');

const SignalFxCollect = require('./index');

describe('basic usage scenarios', () => {
  let endpoint;
  let receivedDatapoints;
  let server;

  beforeEach(() => {
    const app = express();
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
    const client = new signalfx.Ingest('<token>', {
      ingestEndpoint: endpoint
    });

    const collect = new SignalFxCollect({
      signalFxClient: client,
      interval: 20
    });
    collect.start();

    await new Promise(resolve => { setTimeout(resolve, 20 * 5); });
    collect._stop();

    expect(receivedDatapoints.length).toBeGreaterThanOrEqual(3);
    expect(receivedDatapoints.length).toBeLessThanOrEqual(7);
  });
});
