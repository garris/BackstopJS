const mockery = require('mockery');
const sinon = require('sinon');

describe('compare', function () {
  let compare;
  const compareHashes = sinon.stub();
  const compareResemble = sinon.stub();
  const error = new Error();

  before(function () {
    mockery.enable({ warnOnUnregistered: false, warnOnReplace: false, useCleanCache: true });
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

  it.skip('should resolve if compare-hashes succeed', function () {
    compareHashes.withArgs('img1.png', 'img2.png').returns(Promise.resolve());
    compareResemble.returns(Promise.reject(error));

    return compare('img1.png', 'img2.png', 0, {});
  });

  it.skip('should resolve if compare-hashes fail, but compare-resemble succeeds', function () {
    compareHashes.returns(Promise.reject(error));
    compareResemble.withArgs('img1.png', 'img2.png', 0, {}).returns(Promise.resolve());

    return compare('img1.png', 'img2.png', 0, {});
  });

  it.skip('should reject if compare-hashes and compare-resemble fail', function (cb) {
    compareHashes.returns(Promise.reject(error));
    compareResemble.returns(Promise.reject(error));

    compare('img1.png', 'img2.png', 0, {}).catch(() => cb());
  });
});
