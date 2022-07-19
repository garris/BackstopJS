const mockery = require('mockery');
const assert = require('assert');

describe('the runner', function () {
  before(function () {
    mockery.registerMock('./util/makeConfig', function (command, args) {
      return { command, args };
    });
    mockery.registerMock('./command/', function (command, config) {
      return Promise.resolve({ command: command, config: config });
    });
    mockery.enable({ warnOnUnregistered: false });
  });

  after(function () {
    mockery.disable();
  });

  it('should call the command/index with the correct config', function () {
    const runner = require('../../core/runner');
    return runner('test', {}).then(function (args) {
      assert.strictEqual(args.command, 'test');
      assert.deepStrictEqual(args.config, { command: 'test', args: {} });
    });
  });
});
