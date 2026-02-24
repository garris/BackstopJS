const assert = require('assert');
const extendConfig = require('../../../core/util/extendConfig');

describe('computeConfig_spec', function () {
  const baseConfig = { projectPath: process.cwd(), backstop: process.cwd() };

  it('should override engine from config file', function () {
    const actualConfig = extendConfig({ ...baseConfig }, { engine: 'puppet' });
    assert.strictEqual(actualConfig.engine, 'puppet');
  });

  it('should override resembleOutputOptions from config file', function () {
    const actualConfig = extendConfig({ ...baseConfig }, { resembleOutputOptions: { transparency: 0.3 } });
    assert.strictEqual(actualConfig.resembleOutputOptions.transparency, 0.3);
  });

  describe('liveCompare config options', function () {
    it('should set default compareRetries to 0', function () {
      const actualConfig = extendConfig({ ...baseConfig }, {});
      assert.strictEqual(actualConfig.compareRetries, 0);
    });

    it('should override compareRetries from user config', function () {
      const actualConfig = extendConfig({ ...baseConfig }, { compareRetries: 5 });
      assert.strictEqual(actualConfig.compareRetries, 5);
    });

    it('should set default compareRetryDelay to 5000', function () {
      const actualConfig = extendConfig({ ...baseConfig }, {});
      assert.strictEqual(actualConfig.compareRetryDelay, 5000);
    });

    it('should override compareRetryDelay from user config', function () {
      const actualConfig = extendConfig({ ...baseConfig }, { compareRetryDelay: 10000 });
      assert.strictEqual(actualConfig.compareRetryDelay, 10000);
    });

    it('should set default maxNumDiffPixels to 0', function () {
      const actualConfig = extendConfig({ ...baseConfig }, {});
      assert.strictEqual(actualConfig.maxNumDiffPixels, 0);
    });

    it('should override maxNumDiffPixels from user config', function () {
      const actualConfig = extendConfig({ ...baseConfig }, { maxNumDiffPixels: 100 });
      assert.strictEqual(actualConfig.maxNumDiffPixels, 100);
    });

    it('should pass all liveCompare options together', function () {
      const actualConfig = extendConfig({ ...baseConfig }, {
        compareRetries: 3,
        compareRetryDelay: 7500,
        maxNumDiffPixels: 50
      });
      assert.strictEqual(actualConfig.compareRetries, 3);
      assert.strictEqual(actualConfig.compareRetryDelay, 7500);
      assert.strictEqual(actualConfig.maxNumDiffPixels, 50);
    });
  });
});
