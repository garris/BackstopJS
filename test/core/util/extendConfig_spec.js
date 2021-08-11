const assert = require('assert');
const extendConfig = require('../../../core/util/extendConfig');

describe('computeConfig_spec', function () {
  it('should override engine from config file', function () {
    const actualConfig = extendConfig({ projectPath: process.cwd(), backstop: process.cwd() }, { engine: 'puppet' });
    assert.strictEqual(actualConfig.engine, 'puppet');
  });

  it('should override resembleOutputOptions from config file', function () {
    const actualConfig = extendConfig({
      projectPath: process.cwd(),
      backstop: process.cwd()
    }, { resembleOutputOptions: { transparency: 0.3 } });
    assert.strictEqual(actualConfig.resembleOutputOptions.transparency, 0.3);
  });
});
