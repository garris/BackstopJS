var mockery = require('mockery');
var assert = require('assert');

describe('cli', function () {
  before(function () {
    mockery.enable({warnOnUnregistered: false});
  });

  after(function () {
    mockery.disable();
  });

  it('should call the runner without custom options correctly', function (done) {
    process.argv = ['node', 'backstop', 'test'];
    mockery.registerMock('../core/runner', function (command, options) {
      assert.equal(command, 'test');
      done();
      return Promise.resolve();
    });
    require('../../cli/index')
  });
});
