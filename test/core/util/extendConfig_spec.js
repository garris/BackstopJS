var assert = require('assert');
var extendConfig = require('../../../core/util/extendConfig');

describe('computeConfig_spec', function () {

  it('should override engine from config file', function () {
    var actualConfig = extendConfig({projectPath: process.cwd(), backstop: process.cwd()}, {engine:'slimerjs'});
    assert.equal(actualConfig.engine, 'slimerjs');
  });
  it('should override resembleOptions from config file', function () {
    var actualConfig = extendConfig({projectPath: process.cwd(), backstop: process.cwd()}, {resembleOptions:{ignore:'less'}});
    assert.equal(actualConfig.resembleOptions.ignore, 'less');
  });
});
