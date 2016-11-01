var makeConfig = require('../../../core/util/makeConfig');
var assert = require('assert');

describe('make config', function () {
  it('should pass the filter arg correctly', function () {
    var actualConfig = makeConfig('genConfig', {filter: true});
    assert.equal(actualConfig.args.filter, true);
  });
});
