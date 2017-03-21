const mockery = require('mockery');
const sinon = require('sinon');
const assert = require('assert');

describe('compare', function () {
  var compare;
  var compareHashes = sinon.stub();
  var compareResemble = sinon.stub();

  before(function () {
    mockery.enable({warnOnUnregistered: false, warnOnReplace: false, useCleanCache: true});
    mockery.registerMock('./compare-hash', compareHashes);
    mockery.registerMock('./compare-resemble', compareResemble);
    compare = require('../../../../core/util/compare/compare');
  });

  afterEach(() => {
    compareResemble.resetBehavior();
    compareHashes.resetBehavior();
  });

  after(function () {
    mockery.disable();
  });

  it('should resolve if compare-hashes succeed', function () {
    compareHashes.withArgs('img1.png', 'img2.png').returns(Promise.resolve());
    compareResemble.returns(Promise.reject());

    return compare('img1.png', 'img2.png', 0, {});
  });

  it('should resolve if compare-hashes fail, but compare-resemble succeeds', function () {
    compareHashes.returns(Promise.reject());
    compareResemble.withArgs('img1.png', 'img2.png', 0, {}).returns(Promise.resolve());

    return compare('img1.png', 'img2.png', 0, {});
  });
  it('should reject if compare-hashes and compare-resemble fail', function (cb) {
    compareHashes.returns(Promise.reject());
    compareResemble.returns(Promise.reject());

    compare('img1.png', 'img2.png', 0, {}).catch(() => cb());
  });
});
