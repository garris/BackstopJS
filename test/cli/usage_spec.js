var usage = require('../../cli/usage');
var assert = require('assert');

var expectedUsage = "Welcome to BackstopJS 2.1.4 CLI\n\
\n\
Commands:\n\
    reference      Create reference screenshots of your web content at multiple screen sizes.\n\
    test           Create test screenshots of your web content and compare against the set you created using `backstop reference`.\n\
    genConfig      Generate a configuration file boilerplate in your current directory. PLEASE NOTE: this will force overwrite any existing config.\n\
    openReport     View your last test screenshots in your browser.\n\
\n\
Options:\n\
    -h, --help     Display usage\n\
    -v, --version  Display version\n\
    -i             Incremental reference generation\n\
\n\
";

describe('the cli usage', function () {
  it('should print usage hints correctly', function () {
    assert.equal(usage, expectedUsage);
    });
});
