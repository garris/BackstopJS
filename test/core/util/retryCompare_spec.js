const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const REF_IMG1 = path.join(__dirname, 'compare/refImage-1.png');
const REF_IMG2 = path.join(__dirname, 'compare/refImage-2.png');

// retryCompare is called AFTER an initial mismatch is detected
// It attempts to re-capture screenshots and find a matching pair
const retryCompare = require('../../../core/util/retryCompare');

describe('retryCompare', function () {
  this.timeout(10000); // Increase timeout for retry tests

  const buf1 = fs.readFileSync(REF_IMG1);
  const buf2 = fs.readFileSync(REF_IMG2);

  // Create a third distinct image
  const img3 = PNG.sync.read(buf1);
  for (let i = 0; i < 1000; i++) {
    img3.data[i * 4] = 128;
  }
  const buf3 = PNG.sync.write(img3);

  const baseConfig = {
    compareRetries: 0,
    compareRetryDelay: 100,
    maxNumDiffPixels: 0
  };

  const baseScenario = {
    label: 'Test Scenario'
  };

  it('should fail with no retries configured (assumes initial mismatch)', async function () {
    // retryCompare assumes initial comparison failed, so with 0 retries it just fails
    const captureScreenshot = async () => buf1;

    const result = await retryCompare({
      captureScreenshot,
      refPage: {},
      testPage: {},
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 0 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2
    });

    assert.strictEqual(result.pass, false);
    assert(result.refBuffer, 'Should have refBuffer');
    assert(result.testBuffer, 'Should have testBuffer');
  });

  it('should pass when retry captures matching test screenshot', async function () {
    // Simulate: initial test was different, retry captures matching image
    const captureScreenshot = async (page) => {
      // New test capture matches original reference
      return buf1;
    };

    const result = await retryCompare({
      captureScreenshot,
      refPage: {},
      testPage: {},
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2 // Initial mismatch
    });

    assert.strictEqual(result.pass, true);
  });

  it('should pass when retry captures matching reference screenshot', async function () {
    // Simulate: new reference capture matches existing test screenshots
    let callCount = 0;
    const captureScreenshot = async (page) => {
      callCount++;
      // First call (test page) returns different image
      // Second call (ref page) returns image matching initial test
      if (callCount === 1) return buf3;
      return buf2; // Matches initialTestBuffer
    };

    const result = await retryCompare({
      captureScreenshot,
      refPage: { isRef: true },
      testPage: { isTest: true },
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2
    });

    assert.strictEqual(result.pass, true);
  });

  it('should fail after exhausting all retries with persistent mismatch', async function () {
    // Create completely different base images for each capture
    // to prevent any accidental cross-matching
    let callCount = 0;
    const captureScreenshot = async () => {
      callCount++;
      // Create an image with completely different pixel values each time
      // This ensures no cross-matching is possible
      const img = new PNG({ width: 200, height: 142 });
      const baseColor = (callCount * 37) % 256;
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = (baseColor + i) % 256;     // R
        img.data[i + 1] = (baseColor + i * 2) % 256; // G
        img.data[i + 2] = (baseColor + i * 3) % 256; // B
        img.data[i + 3] = 255; // A
      }
      return PNG.sync.write(img);
    };

    const result = await retryCompare({
      captureScreenshot,
      refPage: {},
      testPage: {},
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 2, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2
    });

    assert.strictEqual(result.pass, false);
    assert(result.compositeBuffer, 'Should have compositeBuffer on failure');
  });

  it('should respect scenario-level config overrides', async function () {
    let captureCount = 0;
    const captureScreenshot = async () => {
      captureCount++;
      // Create completely unique images each time
      const img = new PNG({ width: 200, height: 142 });
      const baseColor = (captureCount * 43) % 256;
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = (baseColor + i) % 256;
        img.data[i + 1] = (baseColor + i * 2) % 256;
        img.data[i + 2] = (baseColor + i * 3) % 256;
        img.data[i + 3] = 255;
      }
      return PNG.sync.write(img);
    };

    await retryCompare({
      captureScreenshot,
      refPage: {},
      testPage: {},
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 0 },
      scenario: { ...baseScenario, compareRetries: 2, compareRetryDelay: 10 },
      initialRefBuffer: buf1,
      initialTestBuffer: buf2
    });

    // 2 retries * 2 captures per retry (test + ref) = 4 calls
    assert(captureCount >= 4, 'Should have retried based on scenario config');
  });

  it('should pass when diff pixels within maxNumDiffPixels on retry', async function () {
    // On retry, capture an image that's slightly different but within threshold
    const imgPng = PNG.sync.read(buf1);
    imgPng.data[0] = 254; // Tiny change
    const slightlyDifferentBuf = PNG.sync.write(imgPng);

    const captureScreenshot = async () => slightlyDifferentBuf;

    const result = await retryCompare({
      captureScreenshot,
      refPage: {},
      testPage: {},
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10, maxNumDiffPixels: 100 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2
    });

    assert.strictEqual(result.pass, true, 'Should pass when retry within threshold');
  });

  it('should handle null captureScreenshot results gracefully', async function () {
    let callCount = 0;
    const captureScreenshot = async () => {
      callCount++;
      return null; // Simulates selector not found
    };

    const result = await retryCompare({
      captureScreenshot,
      refPage: {},
      testPage: {},
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2
    });

    assert.strictEqual(result.pass, false, 'Should fail when screenshots are null');
  });

  it('should track best match across retries', async function () {
    // Each retry gets progressively closer to matching
    let callCount = 0;
    const captureScreenshot = async () => {
      callCount++;
      // Create images with decreasing difference
      const img = PNG.sync.read(buf1);
      const pixelsToChange = Math.max(1, 500 - callCount * 100);
      for (let i = 0; i < pixelsToChange; i++) {
        img.data[i * 4] = 128;
      }
      return PNG.sync.write(img);
    };

    const result = await retryCompare({
      captureScreenshot,
      refPage: {},
      testPage: {},
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 3, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2
    });

    // Even if it fails, it should return the best match found
    assert(result.refBuffer, 'Should have best refBuffer');
    assert(result.testBuffer, 'Should have best testBuffer');
  });
});
