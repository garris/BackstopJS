const usage = require('../../cli/usage');
const assert = require('assert');

const expectedUsage = /Welcome to BackstopJS/;

describe('the cli usage', function () {
  it('should print usage hints correctly', function () {
    assert(expectedUsage.test(usage));
  });
});
