var assert = require('assert');
var makeConfig = require('../../../core/util/makeConfig');

describe('make config', function () {
  it('should pass the filter arg correctly', function () {
    var actualConfig = makeConfig('init', { filter: true });
    assert.strictEqual(actualConfig.args.filter, true);
  });

  it('should work without an option param', function () {
    var actualConfig = makeConfig('init');
    assert.strictEqual(actualConfig.args, {});
  });
});
