'use strict';

const chai = require('chai');
const sinon = require('sinon');
const testData = require('./data');

const collect = require('../src/collect');

const cpuUsage = require('../src/utils/cpu-usage');
const memoryUsage = require('../src/utils/memory-usage');
const eventLoopStats = require('event-loop-stats');
const gc = (require('gc-stats'))();
const memwatch = require('memwatch-next');


describe('collect', () => {
  before(() => {
    sinon.stub(cpuUsage, 'sense').callsFake(() => {
      return testData.cpuUsage;
    });
    sinon.stub(memoryUsage, 'sense').callsFake(() => {
      return testData.memoryUsage;
    });
    sinon.stub(eventLoopStats, 'sense').callsFake(() => {
      return testData.eventLoopStats;
    });
  })
  it('should collect cpu/memory/eventloop', () => {
    let metrics = collect.collect();
    chai.expect(metrics).to.have.lengthOf(10);
  });
});

describe('registerEvent', () => {
  let gcCallback;
  let memleakCallback;

  before(() => {
    sinon.stub(gc, 'on').callsFake((eventName, cb) => {
      gcCallback = cb;
    });
    sinon.stub(memwatch, 'on').callsFake((eventName, cb) => {
      memleakCallback = cb;
    });
  });
  it('should register events', () => {
    collect.registerEvent('gc');
    collect.registerEvent('memleak');
    chai.expect(gcCallback).not.to.be.undefined;
    chai.expect(memleakCallback).not.to.be.undefined;
  });
  it('should dispatch gc event', () => {
    let spy = sinon.spy();
    let emitter = collect.getEmitter();
    emitter.on('metrics', spy);
    gcCallback(testData.gcStats);

    sinon.assert.called(spy);
    let dispatchedMetrics = spy.args[0][0];
    chai.expect(dispatchedMetrics[0]).to.include({'metric': 'nodejs.memory.gc.size'});
    let dispatchedEvent = spy.args[0][1];
    chai.expect(dispatchedEvent).to.include({'event': 'gc'});
  });
  it('should dispatch memleak event', () => {
    let spy = sinon.spy();
    let emitter = collect.getEmitter();
    emitter.on('metrics', spy);
    memleakCallback(testData.memleakStats);

    sinon.assert.called(spy);
    let dispatchedMetrics = spy.args[0][0];
    chai.expect(dispatchedMetrics[0]).to.include({'metric': 'nodejs.memory.heap.leak'});
    let dispatchedEvent = spy.args[0][1];
    chai.expect(dispatchedEvent).to.include({'event': 'memleak'});
  });
});
