const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

function resizePng (png, targetWidth, targetHeight) {
  if (png.width === targetWidth && png.height === targetHeight) {
    return png;
  }
  const resized = new PNG({ width: targetWidth, height: targetHeight });
  PNG.bitblt(png, resized, 0, 0, Math.min(png.width, targetWidth), Math.min(png.height, targetHeight), 0, 0);
  return resized;
}

function compareBuffers (buf1, buf2, options) {
  options = options || {};
  const img1 = PNG.sync.read(buf1);
  const img2 = PNG.sync.read(buf2);

  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);
  const isSameDimensions = img1.width === img2.width && img1.height === img2.height;

  const resized1 = resizePng(img1, width, height);
  const resized2 = resizePng(img2, width, height);

  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(
    resized1.data, resized2.data, diff.data,
    width, height,
    { threshold: options.threshold || 0.1 }
  );

  const totalPixels = width * height;
  const misMatchPercentage = ((numDiffPixels / totalPixels) * 100).toFixed(2);

  return {
    numDiffPixels,
    diffPng: diff,
    isSameDimensions,
    dimensionDifference: {
      width: img1.width - img2.width,
      height: img1.height - img2.height
    },
    misMatchPercentage,
    resizedActualPng: resized1,
    resizedExpectedPng: resized2
  };
}

function createCompositeImage (pngImages) {
  // pngImages: array of PNG objects to place side-by-side
  const totalWidth = pngImages.reduce(function (sum, img) { return sum + img.width; }, 0);
  const maxHeight = pngImages.reduce(function (max, img) { return Math.max(max, img.height); }, 0);

  const composite = new PNG({ width: totalWidth, height: maxHeight });

  let xOffset = 0;
  for (let i = 0; i < pngImages.length; i++) {
    const img = pngImages[i];
    PNG.bitblt(img, composite, 0, 0, img.width, img.height, xOffset, 0);
    xOffset += img.width;
  }

  return composite;
}

module.exports = {
  compareBuffers,
  createCompositeImage,
  resizePng
};
