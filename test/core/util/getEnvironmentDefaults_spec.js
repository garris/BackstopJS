const assert = require('assert');
const getEnvironmentDefaults = require('../../../core/util/getEnvironmentDefaults');

describe('core/util/getEnvironmentDefaults', function () {
  afterEach(function () {
    delete process.env.BACKSTOP_ASYNC_CAPTURE_LIMIT;
    delete process.env.BACKSTOP_ASYNC_COMPARE_LIMIT;
  });

  it('should return undefined when variables are unset', function () {
    assert.deepStrictEqual(getEnvironmentDefaults(), { asyncCaptureLimit: undefined, asyncCompareLimit: undefined });
  });

  it('should parse integer variables as integers', function () {
    process.env.BACKSTOP_ASYNC_CAPTURE_LIMIT = '4';
    process.env.BACKSTOP_ASYNC_COMPARE_LIMIT = '8';
    assert.deepStrictEqual(getEnvironmentDefaults(), { asyncCaptureLimit: 4, asyncCompareLimit: 8 });
  });

  // Zero-values coming through as undefined is a side effect of using || and not intentional
  // behaviour. Since setting these values to 0 doesn't make much sense, I've not updated
  // all the call sites.
  it('should return undefined for non-numeric or zero values', function () {
    process.env.BACKSTOP_ASYNC_CAPTURE_LIMIT = 'abc';
    process.env.BACKSTOP_ASYNC_COMPARE_LIMIT = '0';
    assert.deepStrictEqual(getEnvironmentDefaults(), { asyncCaptureLimit: undefined, asyncCompareLimit: undefined });
  });
});
