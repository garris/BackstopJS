const usage = require('../../cli/usage');
const assert = require('assert');

const expectedUsage = /Welcome to BackstopJS/;

describe('the cli usage', function () {
  it('should print usage hints correctly', function () {
    assert(expectedUsage.test(usage));
  });

  it('should include liveCompare command', function () {
    assert(/liveCompare/.test(usage), 'Usage should include liveCompare command');
  });

  it('should describe liveCompare with reference and test URLs', function () {
    assert(/reference.*test.*URLs|test.*reference.*URLs/i.test(usage),
      'liveCompare description should mention reference and test URLs');
  });

  it('should mention retry logic in liveCompare description', function () {
    assert(/retry/i.test(usage), 'liveCompare description should mention retry logic');
  });

  it('should include all standard commands', function () {
    const standardCommands = ['test', 'approve', 'reference', 'init', 'remote', 'openReport', 'liveCompare'];
    standardCommands.forEach(function (cmd) {
      assert(new RegExp(cmd).test(usage), 'Usage should include ' + cmd + ' command');
    });
  });
});
