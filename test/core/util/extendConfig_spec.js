var assert = require('assert');
var extendConfig = require('../../../core/util/extendConfig');

describe('computeConfig_spec', function () {

  it('should override engine from config file', function () {
    var actualConfig = extendConfig({projectPath: process.cwd(), backstop: process.cwd()}, {engine:'slimerjs'});
    assert.equal(actualConfig.engine, 'slimerjs');
  });
  it('should override resembleOutputOptions from config file', function () {
    var actualConfig = extendConfig({projectPath: process.cwd(), backstop: process.cwd()}, {resembleOutputOptions:{transparency:0.3}});
    assert.equal(actualConfig.resembleOutputOptions.transparency, 0.3);
  });
});
