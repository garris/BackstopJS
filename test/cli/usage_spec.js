var usage = require('../../cli/usage');
var assert = require('assert');

var expectedUsage = /Welcome to BackstopJS/;

describe('the cli usage', function () {
  it('should print usage hints correctly', function () {
    assert(expectedUsage.test(usage));
  });
});
