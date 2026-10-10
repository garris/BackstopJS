const assert = require('assert');

describe('Puppeteer helpers', function () {
  it('loads the shipped CSP helper without Puppeteer transitive dependencies', function () {
    assert.strictEqual(typeof require('../../../capture/engine_scripts/puppet/ignoreCSP'), 'function');
  });
});
