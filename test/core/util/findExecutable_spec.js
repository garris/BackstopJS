var mockery = require('mockery');
var findExecutable = require('../../../core/util/findExecutable');
var assert = require('assert');

describe('findExecutable_spec.js', function () {
  before(function () {
    mockery.enable({ useCleanCache: true });
  });

  it('should print a meaningful error the executable cannot be found', function () {
    assert.throws(function () {
      findExecutable('no-installed-module', 'invalid-bin');
    }, /Couldn't find executable for module "no-installed-module" and bin "invalid-bin"/);
  });
});
