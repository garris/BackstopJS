const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { compareBuffers, createCompositeImage, resizePng } = require('../../../../core/util/compare/pixelmatch-inline');
const { PNG } = require('pngjs');

const REF_IMG1 = path.join(__dirname, 'refImage-1.png');
const REF_IMG2 = path.join(__dirname, 'refImage-2.png');

describe('pixelmatch-inline', function () {
  describe('compareBuffers', function () {
    it('should return zero diff pixels for identical images', function () {
      const buf = fs.readFileSync(REF_IMG1);
      const result = compareBuffers(buf, buf);

      assert.strictEqual(result.numDiffPixels, 0);
      assert.strictEqual(result.isSameDimensions, true);
      assert.strictEqual(result.dimensionDifference.width, 0);
      assert.strictEqual(result.dimensionDifference.height, 0);
      assert.strictEqual(result.misMatchPercentage, '0.00');
    });

    it('should return non-zero diff pixels for different images', function () {
      const buf1 = fs.readFileSync(REF_IMG1);
      const buf2 = fs.readFileSync(REF_IMG2);
      const result = compareBuffers(buf1, buf2);

      assert(result.numDiffPixels > 0, 'Expected numDiffPixels > 0');
      assert(result.diffPng instanceof PNG, 'Expected diffPng to be a PNG');
      assert(parseFloat(result.misMatchPercentage) > 0, 'Expected misMatchPercentage > 0');
    });

    it('should use custom threshold option', function () {
      const buf1 = fs.readFileSync(REF_IMG1);
      const buf2 = fs.readFileSync(REF_IMG2);

      const resultLowThreshold = compareBuffers(buf1, buf2, { threshold: 0.01 });
      const resultHighThreshold = compareBuffers(buf1, buf2, { threshold: 0.9 });

      // Higher threshold should result in fewer diff pixels
      assert(resultHighThreshold.numDiffPixels <= resultLowThreshold.numDiffPixels,
        'Higher threshold should produce fewer or equal diff pixels');
    });

    it('should handle images of different sizes', function () {
      const buf1 = fs.readFileSync(REF_IMG1);
      // Create a smaller image buffer
      const img1 = PNG.sync.read(buf1);
      const smallerPng = new PNG({ width: img1.width - 10, height: img1.height - 10 });
      PNG.bitblt(img1, smallerPng, 0, 0, smallerPng.width, smallerPng.height, 0, 0);
      const buf2 = PNG.sync.write(smallerPng);

      const result = compareBuffers(buf1, buf2);

      assert.strictEqual(result.isSameDimensions, false);
      assert.strictEqual(result.dimensionDifference.width, 10);
      assert.strictEqual(result.dimensionDifference.height, 10);
    });
  });

  describe('createCompositeImage', function () {
    it('should create a composite image from multiple PNGs', function () {
      const buf = fs.readFileSync(REF_IMG1);
      const png1 = PNG.sync.read(buf);
      const png2 = PNG.sync.read(buf);
      const png3 = PNG.sync.read(buf);

      const composite = createCompositeImage([png1, png2, png3]);

      assert.strictEqual(composite.width, png1.width * 3);
      assert.strictEqual(composite.height, png1.height);
      assert(composite instanceof PNG, 'Expected composite to be a PNG');
    });

    it('should handle images of different heights', function () {
      const buf = fs.readFileSync(REF_IMG1);
      const png1 = PNG.sync.read(buf);

      // Create a taller image
      const tallPng = new PNG({ width: png1.width, height: png1.height + 50 });
      PNG.bitblt(png1, tallPng, 0, 0, png1.width, png1.height, 0, 0);

      const composite = createCompositeImage([png1, tallPng]);

      assert.strictEqual(composite.width, png1.width * 2);
      assert.strictEqual(composite.height, png1.height + 50, 'Composite height should be max of input heights');
    });

    it('should return empty image for empty array', function () {
      const composite = createCompositeImage([]);

      assert.strictEqual(composite.width, 0);
      assert.strictEqual(composite.height, 0);
    });
  });

  describe('resizePng', function () {
    it('should return same PNG if dimensions match', function () {
      const buf = fs.readFileSync(REF_IMG1);
      const png = PNG.sync.read(buf);

      const resized = resizePng(png, png.height, png.width);

      assert.strictEqual(resized, png, 'Should return same PNG instance');
    });

    it('should resize PNG to target dimensions', function () {
      const buf = fs.readFileSync(REF_IMG1);
      const png = PNG.sync.read(buf);
      const targetWidth = png.width + 20;
      const targetHeight = png.height + 20;

      const resized = resizePng(png, targetHeight, targetWidth);

      assert.strictEqual(resized.width, targetWidth);
      assert.strictEqual(resized.height, targetHeight);
      assert.notStrictEqual(resized, png, 'Should return new PNG instance');
    });
  });
});
