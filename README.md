<p align="center">
  <a href="https://github.com/signalfx/signalfx-nodejs-collect/releases">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/signalfx/signalfx-nodejs-collect?include_prereleases&logo=github&style=for-the-badge&cacheSeconds=3600">
  </a>
  <img alt="GitHub branch checks state" src="https://img.shields.io/github/checks-status/signalfx/signalfx-nodejs-collect/main?style=for-the-badge&logo=github&cacheSeconds=3600">
  <img alt="npm" src="https://img.shields.io/npm/v/signalfx-collect?style=for-the-badge&logo=npm&cacheSeconds=3600">
  <img alt="node-current" src="https://img.shields.io/node/v/signalfx-collect?style=for-the-badge&logo=nodedotjs&cacheSeconds=3600">
</p>

# SignalFx Node.js Collect

The SignalFx Node.js Collect is a library to monitor a Node.js application. It collects metrics about CPU utilization, memory usage, event loop, memory leaks, garbage collection and HTTP requests.

## Installation
To install using npm:

```sh
$ npm install signalfx-collect
```

**Note:** You will get an error when `> node-pre-gyp install --fallback-to-build` is executed, stating that pre-built binaries couldn't be downloaded. We do not provide pre-built binaries. To ensure that no one can exploit binaries fetching we point `node-pre-gyp` to one of our domains, to a path which returns 403.

## Usage

To use this library, you need a SignalFx org access token. For more information on access tokens, see the API's [Authentication documentation](https://developers.signalfx.com/basics/authentication.html). If your organization is currently sending metrics to SignalFx through [SignalFx Node.js client](https://github.com/signalfx/signalfx-nodejs), you can provide a preconfigured client object instead of an org access token.

The code example below is how to import signalfx-collect and start collecting metrics. Collect HTTP request metrics by registering middleware to your express application as shown in the example code below.

```js
const express = require('express');
const app = express();

const SignalFxCollect = require('signalfx-collect');

let config = {
    accessToken: 'MY_ACCESS_TOKEN',
    interval: 1000
};

const collect = new SignalFxCollect(config);
collect.start();

// Add a middleware from SignalFxCollect module to collect HTTP metrics
app.use(collect.getMiddleware('express'));
app.get('/hello', (req, res) => {
    res.send('world');
});
```

To authenticate with a client object rather than an org access token, use the following example code:

```js
...

const signalfx = require('signalfx');
const client = new signalfx.Ingest('MY_ACCESS_TOKEN');

let config = {
    signalFxClient: client,
    interval: 1000
};
const collect = new SignalFxCollect(config);
collect.start();

...
```

Once `collect.start()` is called, signalfx-collect will start polling for the metrics based on a provided interval in milliseconds.

When creating a neew `SignalFxCollect` instance, you must pass the `config` object which may contain the following fields:
+ **accessToken** (string) - SignalFx access token as explained above.
+ **signalFxClient** (string) - SignalFx Ingest client object.
+ **ingestEndpoint** (string) - custom url to send datapoints in format http://custom.domain/api/path
+ **interval** (int) - interval rate in milliseconds. (**default**: `10000`)
+ **extraDimensions** (dict) - a dictionary of additional dimensions sent with metrics and events with string keys/values. Default is an empty dictionary.
+ **logLevel** (string) - a level for logging verbosity. Available levels are `debug`, `info`. No log will be shown except system exceptions if the level is not specified.

Below are the metrics sent by SignalFx Node.js Collect:

## Metrics
- `nodejs.cpu.utilization.system` (*gauge*)
- `nodejs.cpu.utilization.user` (*gauge*)
- `nodejs.cpu.utilization.total` (*gauge*)
- `nodejs.memory.system.total` (*gauge*)
- `nodejs.memory.system.free` (*gauge*)
- `nodejs.memory.heap.total` (*gauge*)
- `nodejs.memory.heap.used` (*gauge*)
- `nodejs.memory.rss` (*gauge*)
- `nodejs.memory.gc.size` (*cumulative_counter*)
- `nodejs.memory.gc.pause` (*cumulative_counter*)
- `nodejs.memory.gc.total` (*cumulative_counter*)
- `nodejs.memory.heap.leak` (*cumulative_counter*)
- `nodejs.event_loop.max` (*gauge*)
- `nodejs.event_loop.min` (*gauge*)
- `nodejs.http.rq_total` (*cumulative_counter*)
- `nodejs.http.rq_time` (*gauge*)
- `nodejs.http.rq_<status_code>` (*cumulative_counter*)
- `nodejs.http.rq_size` (*gauge*)


## License

Apache Software License v2 © [SignalFx](https://signalfx.com)
