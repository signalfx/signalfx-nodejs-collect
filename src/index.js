'use strict';

const SignalFxSender = require('./utils/signalfx-sender');
const collect = require('./collect');
const middleware = require('./middleware');
const register = require('./register');
const { DEFAULT_INTERVAL_MILLISECONDS, DEFAULT_EVENT, LOG_LEVEL } = require('./common/constants');

module.exports = class SignalFxCollect {
  constructor(config) {
    validateConfig(config);

    this.interval = config.interval || DEFAULT_INTERVAL_MILLISECONDS;
    this.clientConfig = {
      interval: this.interval
    };
    if (config.signalFxClient) {
      this.clientConfig.client = config.signalFxClient;
    }
    else {
      this.clientConfig.ingestEndpoint = config.ingestEndpoint;
      this.clientConfig.accessToken = config.accessToken;
    }
    
    this.clientConfig.logLevel = LOG_LEVEL.NONE;
    if (typeof config.logLevel === 'string') {
      if (config.logLevel.toLowerCase() === 'debug') {
        this.clientConfig.logLevel = LOG_LEVEL.DEBUG;
      }
      else if (config.logLevel.toLowerCase() === 'info') {
        this.clientConfig.logLevel = LOG_LEVEL.INFO;
      }
    }
    
    this._enableEvents(config.sendEvent);
    if (typeof config.extraDimensions === 'object') {
      register.addBasicDimensions(config.extraDimensions);
    }
  }

  start() {
    this.sender = new SignalFxSender(this.clientConfig);

    this._startCollectLoop(this.interval);
    this._registerEventHandlers();
  }

  getMiddleware(framework) {
    switch (framework) {
    case 'express':
      return middleware.express();
    case 'koa':
      return middleware.koa();
    }
    throw `${framework} is not supported.`;
  }

  _enableEvents(userSetting) {
    this.events = Object.assign({}, DEFAULT_EVENT);
    if (userSetting) {
      Object.keys(userSetting).forEach(event => {
        if (this.events[event] !== undefined) {
          this.events[event] = userSetting[event];
        }
      });
    }
  }

  _startCollectLoop(interval) {
    setInterval(() => {
      collect.collect();
    }, interval);
  }

  _registerEventHandlers() {
    collect.registerEvent('gc');
    collect.registerEvent('memleak');
  }
};

function validateConfig(config) {
  if (!config) {
    throw 'Config object is required.';
  }
}
