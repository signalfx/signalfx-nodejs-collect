'use strict';

const chai = require('chai');
const testData = require('./data');

const adapter = require('../src/adapters');

describe('adapter', function () {
    it('should convert cpu usage', function () {
        let converted = adapter.metric.cpuUsage(testData.cpuUsage);
        chai.expect(converted).to.have.lengthOf(3);
    });
    it('should convert memory usage', function () {
        let converted = adapter.metric.memoryUsage(testData.memoryUsage);
        chai.expect(converted).to.have.lengthOf(5);
    });
    it('should convert event loop stats', function () {
        let converted = adapter.metric.eventLoop(testData.eventLoopStats);
        chai.expect(converted).to.have.lengthOf(2);
    });
    it('should convert gc stats', function () {
        let converted = adapter.metric.cpuUsage(testData.cpuUsage);
        chai.expect(converted).to.have.lengthOf(3);
    });
    it('should convert memory leak stats', function () {
        let converted = adapter.metric.cpuUsage(testData.cpuUsage);
        chai.expect(converted).to.have.lengthOf(3);
    });
});
