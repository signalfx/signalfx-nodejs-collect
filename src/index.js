'use strict';

const SignalFxSender = require('./utils/signalfx-sender');
const collect = require('./collect');
const middleware = require('./middleware');
const adapters = require('./adapters');
const { DEFAULT_INTERVAL, DEFAULT_EVENT } = require('./common/constants');

module.exports = class SignalFxCollect {
  constructor(config) {
    validateConfig(config);

    this.accessToken = config.accessToken;
    this.interval = config.interval || DEFAULT_INTERVAL;
    this._enableEvents(config.sendEvent);
    if (typeof config.extraDimensions === 'object') {
      adapters.addBasicDimensions(config.extraDimensions);
    }
  }

  start() {
    this.sender = new SignalFxSender(this.accessToken);

    this._startCollectLoop(this.interval);
    this._registerEventHandlers();
  }

  getMiddleware(framework) {
    switch (framework) {
    case 'express':
      return middleware.express(metrics => this.sender.send(metrics));
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
      this.sender.send(collect.collect());
    }, interval);
  }

  _registerEventHandlers() {
    collect.registerEvent('gc');
    collect.registerEvent('memleak');

    collect.getEmitter().on('metrics', (metrics, event) => {
      this.sender.send(metrics);
      if (this.events[event.event]) {
        this.sender.sendEvent(event);
      }
    });
  }
};

function validateConfig(config) {
  if (!config) {
    throw 'Config object is required.';
  }
  if (!config.accessToken) {
    throw 'accessToken is required.';
  }
}
