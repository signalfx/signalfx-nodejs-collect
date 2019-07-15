# SignalFx Node.js Collect

The SignalFx Node.js Collect is a library to monitor a Node.js application. It collects metrics about CPU utilization, memory usage, event loop, memory leaks, garbage collection and HTTP requests.

## Installation
To install using npm:

```sh
$ npm install signalfx-collect
```

## Usage
To use this library, you need a SignalFx org access token. For more information on access tokens, see the API's [Authentication documentation](https://developers.signalfx.com/basics/authentication.html). In case you are already sending metrics to SignalFx through [SignalFx Node.js client](https://github.com/signalfx/signalfx-nodejs), you can provide a preconfigured client object instead of an org access token.


This example shows how to import signalfx-collect and start collecting metrics.

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

You can also provide SignalFx client object instead of an org access token as mentioned above:

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

Once `collect.start()` is called, signalfx-collect will start polling for the metrics based on a provided interval in milliseconds. You can also collect HTTP request metrics by registering a middleware to your express application as shown in the example.

Object `config` must be passed when creating a new `SignalFxCollect` instance and may contain following fields:
+ **accessToken** (string, required if **signalFxClient** is not provided) - SignalFx access token as explained above.
+ **signalFxClient** (string, required if **accessToken** is not provided) - SignalFx Ingest client object.
+ **interval** (int) - Interval rate in milliseconds.
+ **extraDimensions** (dict) - a map of extra dimensions to be sent with metrics and events. empty dictionary by default.

## Metrics
- `nodejs.cpu.utilization.system` (*gauge*)
- `nodejs.cpu.utilization.user` (*gauge*)
- `nodejs.cpu.utilization.total` (*gauge*)
- `nodejs.memory.system.total` (*gauge*)
- `nodejs.memory.system.free` (*gauge*)
- `nodejs.memory.heap.total` (*gauge*)
- `nodejs.memory.heap.used` (*gauge*)
- `nodejs.memory.rss` (*gauge*)
- `nodejs.memory.gc.size` (*gauge*)
- `nodejs.memory.gc.pause` (*gauge*)
- `nodejs.memory.heap.leak` (*gauge*)
- `nodejs.event_loop.max` (*gauge*)
- `nodejs.event_loop.min` (*gauge*)
- `nodejs.http.rq_total` (*counter*)
- `nodejs.http.rq_time` (*gauge*)
- `nodejs.http.rq_<status_code>` (*counter*)
- `nodejs.http.rq_size` (*gauge*)


## License

Apache Software License v2 © [SignalFx](https://signalfx.com)