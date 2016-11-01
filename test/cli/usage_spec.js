const usage = require('../../cli/usage');
const assert = require('assert');

const expectedUsage = `Welcome to BackstopJS 2.1.3 CLI

Commands:
    reference      Create reference screenshots of your web content at multiple sceen sizes.
    test           Create test screenshots of your web content and compare against the set you created using \`backstop reference\`.
    genConfig      Generate a configuration file boilerplate in your current directory. PLEASE NOTE: this will force overwrite any existing config.
    openReport     View your last test screenshots in your browser.

Options:
    -h, --help     Display usage
    -v, --version  Display version
    -i             Incremental reference generation

`;

describe('the cli usage', function () {
  it('should print usage hints correctly', function () {
    assert.equal(usage, expectedUsage);
    });
});
