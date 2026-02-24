const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const REF_IMG1 = path.join(__dirname, 'compare/refImage-1.png');
const REF_IMG2 = path.join(__dirname, 'compare/refImage-2.png');

// retryCompare is called AFTER an initial mismatch is detected
// It attempts to re-capture screenshots and find a matching pair
const retryCompare = require('../../../core/util/retryCompare');

// Mock preparePage — no-op, avoids real browser navigation in unit tests
const mockPreparePage = async function () {};

// Mock page with no-op setViewport (needed for viewport reset in retry loop)
function createMockPage (props) {
  return Object.assign({ setViewport: async function () {} }, props);
}

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
    label: 'Test Scenario',
    url: 'http://test.example.com',
    referenceUrl: 'http://ref.example.com'
  };

  it('should fail with no retries configured (assumes initial mismatch)', async function () {
    // retryCompare assumes initial comparison failed, so with 0 retries it just fails
    const captureScreenshot = async () => buf1;

    const result = await retryCompare({
      captureScreenshot,
      preparePage: mockPreparePage,
      refPage: {},
      testPage: {},
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 0 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
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
      preparePage: mockPreparePage,
      refPage: createMockPage(),
      testPage: createMockPage(),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2, // Initial mismatch
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
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
      preparePage: mockPreparePage,
      refPage: createMockPage({ isRef: true }),
      testPage: createMockPage({ isTest: true }),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
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
      preparePage: mockPreparePage,
      refPage: createMockPage(),
      testPage: createMockPage(),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 2, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
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
      preparePage: mockPreparePage,
      refPage: createMockPage(),
      testPage: createMockPage(),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 0 },
      scenario: { ...baseScenario, compareRetries: 2, compareRetryDelay: 10 },
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
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
      preparePage: mockPreparePage,
      refPage: createMockPage(),
      testPage: createMockPage(),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10, maxNumDiffPixels: 100 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
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
      preparePage: mockPreparePage,
      refPage: createMockPage(),
      testPage: createMockPage(),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
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
      preparePage: mockPreparePage,
      refPage: createMockPage(),
      testPage: createMockPage(),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 3, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
    });

    // Even if it fails, it should return the best match found
    assert(result.refBuffer, 'Should have best refBuffer');
    assert(result.testBuffer, 'Should have best testBuffer');
  });

  it('should call preparePage before each capture on every retry', async function () {
    const preparePageCalls = [];
    const mockPreparePageTracking = async function (page, url) {
      preparePageCalls.push({ page, url });
    };

    // Create images that always mismatch (completely different pixel data)
    let callCount = 0;
    const captureScreenshot = async () => {
      callCount++;
      const img = new PNG({ width: 200, height: 142 });
      const baseColor = (callCount * 37) % 256;
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
      preparePage: mockPreparePageTracking,
      refPage: createMockPage({ id: 'ref' }),
      testPage: createMockPage({ id: 'test' }),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 2, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
    });

    // 2 retries * 2 pages (test + ref) = 4 preparePage calls
    assert.strictEqual(preparePageCalls.length, 4, 'preparePage should be called 4 times for 2 retries');

    // Verify URLs: each retry prepares test page then ref page (in parallel, but both called)
    const testUrls = preparePageCalls.filter(c => c.url === 'http://test.example.com');
    const refUrls = preparePageCalls.filter(c => c.url === 'http://ref.example.com');
    assert.strictEqual(testUrls.length, 2, 'Should prepare test page twice');
    assert.strictEqual(refUrls.length, 2, 'Should prepare ref page twice');
  });

  it('should re-navigate before capture, not after', async function () {
    const callOrder = [];

    const mockPreparePageOrder = async function () {
      callOrder.push('preparePage');
    };

    // Create images that always mismatch
    let callCount = 0;
    const captureScreenshot = async () => {
      callCount++;
      callOrder.push('capture');
      const img = new PNG({ width: 200, height: 142 });
      const baseColor = (callCount * 37) % 256;
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
      preparePage: mockPreparePageOrder,
      refPage: createMockPage(),
      testPage: createMockPage(),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 1, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
    });

    // For 1 retry: preparePage (test + ref in parallel), then capture test, then capture ref
    // preparePage calls come first, then captures
    assert.strictEqual(callOrder[0], 'preparePage', 'First action should be preparePage');
    assert.strictEqual(callOrder[1], 'preparePage', 'Second action should be preparePage');
    assert.strictEqual(callOrder[2], 'capture', 'Third action should be capture');
    assert.strictEqual(callOrder[3], 'capture', 'Fourth action should be capture');
  });

  it('should reset viewport before each retry', async function () {
    const viewportCalls = [];
    const mockPage = (id) => ({
      id,
      setViewport: async function (vp) { viewportCalls.push({ id, ...vp }); }
    });

    let callCount = 0;
    const captureScreenshot = async () => {
      callCount++;
      const img = new PNG({ width: 200, height: 142 });
      const baseColor = (callCount * 37) % 256;
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
      preparePage: mockPreparePage,
      refPage: mockPage('ref'),
      testPage: mockPage('test'),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 2, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
    });

    // 2 retries * 2 pages = 4 viewport reset calls
    assert.strictEqual(viewportCalls.length, 4, 'Should reset viewport 4 times for 2 retries');
    // All resets should use the original viewport dimensions
    viewportCalls.forEach(function (call) {
      assert.strictEqual(call.width, 800, 'Viewport width should be reset to 800');
      assert.strictEqual(call.height, 600, 'Viewport height should be reset to 600');
    });
  });

  it('should continue retrying when preparePage fails', async function () {
    let prepareCallCount = 0;
    let captureCallCount = 0;
    const failingPreparePage = async function () {
      prepareCallCount++;
      if (prepareCallCount <= 2) {
        // First retry: both preparePage calls fail (they run in parallel)
        throw new Error('Navigation timeout');
      }
      // Second retry: succeed
    };

    const captureScreenshot = async () => {
      captureCallCount++;
      return buf1; // Matches initialRefBuffer
    };

    const result = await retryCompare({
      captureScreenshot,
      preparePage: failingPreparePage,
      refPage: createMockPage(),
      testPage: createMockPage(),
      selector: 'body',
      selectorMap: {},
      viewport: { width: 800, height: 600 },
      config: { ...baseConfig, compareRetries: 2, compareRetryDelay: 10 },
      scenario: baseScenario,
      initialRefBuffer: buf1,
      initialTestBuffer: buf2,
      refBrowserOrContext: {},
      testBrowserOrContext: {},
      engineScriptsPath: ''
    });

    // First retry failed (preparePage threw), second retry should succeed
    assert.strictEqual(result.pass, true, 'Should pass after recovering from preparePage failure');
    assert(captureCallCount > 0, 'Should have captured screenshots on the successful retry');
  });
});
