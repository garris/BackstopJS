const compareResemble = require('../../../../core/util/compare/compare-resemble');
const path = require('path');

const REF_IMG1 = path.join(__dirname, 'refImage-1.png');
const REF_IMG1_OPTIMIZED = path.join(__dirname, 'refImage-1-optimized.png');
const REF_IMG2 = path.join(__dirname, 'refImage-2.png');
const REF_IMG3 = path.join(__dirname, 'refImage-3.png');

describe('compare-resemble', function () {
  it('should resolve if the same image is compared', function () {
    return compareResemble(REF_IMG1, REF_IMG1, 0, {});
  });
  it('should resolve if two images have the same content', function () {
    return compareResemble(REF_IMG1, REF_IMG1_OPTIMIZED, 0, {});
  });
  it('should reject if two images exceed the mismatchThreshold', function (cb) {
    compareResemble(REF_IMG1, REF_IMG2, 0, {}).then(
      () => cb(new Error('should have rejected')),
      () => cb()
    );
  });
  it('should use resemble\'s rounded misMatchPercentage value per default', function () {
    return compareResemble(REF_IMG1, REF_IMG3, 0, {});
  });
  it('should use resemble\'s more precise rawMisMatchPercentage value if specified', function (cb) {
    compareResemble(REF_IMG1, REF_IMG3, 0, { usePreciseMatching: true }, true).then(
      () => cb(new Error('should have rejected')),
      () => cb()
    );
  });
});
