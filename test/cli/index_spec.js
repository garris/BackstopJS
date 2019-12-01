const mockery = require('mockery');
const assert = require('assert');
const sinon = require('sinon');

describe('cli', function () {
  beforeEach(function () {
    mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
  });

  afterEach(function () {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call the runner without custom options correctly', function (done) {
    process.argv = ['node', 'backstop', 'test'];
    const promiseMock = Promise.resolve();
    const runnerMock = sinon.stub().returns(promiseMock);
    mockery.registerMock('../core/runner', runnerMock);

    require('../../cli/index');

    promiseMock.then(() => {
      assert.strictEqual(process.exitCode, undefined);
      assert(runnerMock.calledWith('test'));
      done();
    });
  });

  it('should exit with code 1 if runner fails', function (done) {
    process.argv = ['node', 'backstop', 'test'];
    const promiseMock = Promise.reject(new Error('errorMock'));
    const runnerMock = sinon.stub().returns(promiseMock);
    mockery.registerMock('../core/runner', runnerMock);

    require('../../cli/index');

    promiseMock.catch(() => {
      assert.strictEqual(process.exitCode, 1);
      done();
    });
  });
});
