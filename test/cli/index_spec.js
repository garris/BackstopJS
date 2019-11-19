var mockery = require('mockery');
var assert = require('assert');

describe('cli', function () {
  before(function () {
    mockery.enable({ warnOnUnregistered: false });
  });

  after(function () {
    mockery.disable();
  });

  // causes issue with CI https://github.com/garris/BackstopJS/issues/1006
  it.skip('should call the runner without custom options correctly', function (done) {
    process.argv = ['node', 'backstop', 'test'];
    mockery.registerMock('../core/runner', function (command, options) {
      assert.strictEqual(command, 'test');
      done();
      return Promise.resolve();
    });
    require('../../cli/index');
  });
});
