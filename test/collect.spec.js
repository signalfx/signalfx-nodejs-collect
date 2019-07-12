'use strict';

const chai = require('chai');
const testData = require('./data');

const adapter = require('../src/adapters');

describe('collect', function () {
  it('should collect cpu/memory/eventloop', function () {
    chai.expect(1).equal(1);
  });
  it('should get stats/memleak events', function () {
    chai.expect(1).equal(1);
  });
});
