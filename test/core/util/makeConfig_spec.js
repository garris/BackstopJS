var assert = require('assert');
var makeConfig = require('../../../core/util/makeConfig');

describe('make config', function () {
  it('should pass the filter arg correctly', function () {
    var actualConfig = makeConfig('genConfig', {filter: true});
    assert.equal(actualConfig.args.filter, true);
  });

  it('should work without an option param', function () {
    var actualConfig = makeConfig('genConfig');
    assert.deepEqual(actualConfig.args, {});
  });
});
