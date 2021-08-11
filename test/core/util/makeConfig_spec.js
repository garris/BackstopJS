const assert = require('assert');
const makeConfig = require('../../../core/util/makeConfig');

describe('make config', function () {
  it('should pass the filter arg correctly', function () {
    const actualConfig = makeConfig('init', { filter: true });
    assert.strictEqual(actualConfig.args.filter, true);
  });

  it('should work without an option param', function () {
    const actualConfig = makeConfig('init');
    assert.deepStrictEqual(actualConfig.args, {});
  });
});
