var usage = require('../../cli/usage');
var assert = require('assert');

var expectedUsage = `Welcome to BackstopJS 3.2.16 CLI

Commands:
    test           Create test screenshots and compare against the set you previously approved/referenced.
    approve        Promotes all test bitmaps from last test run to reference bitmaps.
    reference      Creates new reference screenshots. Deletes all existing reference files.
    init           Generate BackstopJS boilerplate files in your CWD. NOTE: Overwrites existing config files!
    openReport     View the last test report in your browser.

Options:
    -h, --help     Display usage
    -v, --version  Display version
    -i             incremental reference generation

`;

describe('the cli usage', function () {
  it('should print usage hints correctly', function () {
    assert.equal(usage, expectedUsage);
  });
});
