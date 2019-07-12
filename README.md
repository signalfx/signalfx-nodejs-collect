# SignalFx Node.js Collect

The SignalFx Node.js Collect is a library to monitor a Node.js application. It collects metrics about CPU utilization, memory usage, event loop, memory leaks, garbage collection and HTTP requests. A complete list of metrics can be found [here](metrics.md).

## Installation
To install using npm:
```sh
$ npm install signalfx-collect
```

## Usage
To use this library, you need a SignalFx access token. For more information on access tokens, see the API's [Authentication documentation](https://developers.signalfx.com/basics/authentication.html).


This example shows how to import signalfx-collect and start collecting metrics.

```js
const express = require('express');
const app = express();

const SignalFxCollect = require('signalfx-collect');

let config = {
    accessToken: 'MY_ACCESS_TOKEN',
    interval: 1000
}

const collect = new SignalFxCollect(config);
collect.start();

app.use(collect.getMiddleware('express'));
app.get('/hello', (req, res) => {
    res.send('world');
});
```

Once `collect.start()` is called, signalfx-collect will start polling for the metrics based on a provided interval in milliseconds. You can also collect HTTP request metrics by registering a middleware to your express application as shown in the example.

Object `config` must be passed when creating a new `SignalFxCollect` instance and may contain following fields:
+ **accessToken** (string, required) - SignalFx access token as explained above.
+ **interval** (int) - Interval rate in milliseconds.
+ **sendEvent** (dict of (event name, true/false)) - a map of event enablement setting. Supported event names are `memleak`, `gc`.
+ **extraDimensions** (dict) - a map of extra dimensions to be sent with metrics and events. empty dictionary by default.

## License

Apache Software License v2 © [SignalFx](https://signalfx.com)