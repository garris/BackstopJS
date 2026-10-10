const assert = require('assert');
const puppeteerOptions = require('../../../core/util/puppeteerOptions');

describe('Puppeteer launch options', function () {
  it('keeps the default headless and certificate behavior', function () {
    assert.deepStrictEqual(puppeteerOptions({}), {
      acceptInsecureCerts: true,
      headless: true
    });
  });

  it('opens a browser window when debugging', function () {
    assert.strictEqual(puppeteerOptions({ debugWindow: true }).headless, false);
  });

  it('keeps explicit headless choices and other launch options', function () {
    for (const headless of [true, false, 'shell']) {
      const engineOptions = { headless, args: ['--no-sandbox'] };
      const options = puppeteerOptions({ engineOptions });
      assert.strictEqual(options.headless, headless);
      assert.deepStrictEqual(options.args, engineOptions.args);
      assert.deepStrictEqual(engineOptions, { headless, args: ['--no-sandbox'] });
    }
  });

  it('accepts the legacy new headless setting', function () {
    assert.strictEqual(puppeteerOptions({ engineOptions: { headless: 'new' } }).headless, true);
  });

  it('keeps certificate validation enabled for legacy configurations', function () {
    const options = puppeteerOptions({ engineOptions: { ignoreHTTPSErrors: false } });
    assert.strictEqual(options.acceptInsecureCerts, false);
    assert.strictEqual(Object.hasOwn(options, 'ignoreHTTPSErrors'), false);
  });

  it('uses an explicit certificate option before its legacy alias', function () {
    for (const acceptInsecureCerts of [true, false]) {
      const options = puppeteerOptions({
        engineOptions: { acceptInsecureCerts, ignoreHTTPSErrors: !acceptInsecureCerts }
      });
      assert.strictEqual(options.acceptInsecureCerts, acceptInsecureCerts);
    }
  });
});
