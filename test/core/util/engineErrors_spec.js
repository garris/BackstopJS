const engineErrors = require('../../../core/util/engineErrors');
const assert = require('assert');

describe('core/util/engineErrors', function () {
  it('should resolve if no engineErrors errors found', function () {
    const config = {
      tempCompareConfigFileName: '../../test/core/util/fixtures/engineErrorsSuccess.json'
    };
    return engineErrors(config).then(function (args) {
      assert.strictEqual(args, undefined);
    });
  });

  it('should reject if engineErros found', function () {
    const config = {
      tempCompareConfigFileName: '../../test/core/util/fixtures/engineErrorsFail.json'
    };
    return engineErrors(config).catch(function (args) {
      assert.strictEqual(args.engineErrorMsg, 'Engine error fail');
    });
  });
});
