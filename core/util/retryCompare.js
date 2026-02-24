const { PNG } = require('pngjs');
const { compareBuffers, createCompositeImage } = require('./compare/pixelmatch-inline');
const defaultPreparePage = require('./preparePage');
const logger = require('./logger')('retryCompare');

function tryMatchAgainstAll (newScreenshot, existingScreenshots, maxNumDiffPixels) {
  let leastDiffPixels = Infinity;
  let bestResult = null;
  let bestIndex = -1;

  for (let i = 0; i < existingScreenshots.length; i++) {
    const result = compareBuffers(newScreenshot, existingScreenshots[i], { threshold: 0.2 });

    if (result.numDiffPixels <= maxNumDiffPixels) {
      return { pass: true, matchIndex: i, result };
    }

    if (result.numDiffPixels < leastDiffPixels) {
      leastDiffPixels = result.numDiffPixels;
      bestResult = result;
      bestIndex = i;
    }
  }

  return { pass: false, bestIndex, bestResult, leastDiffPixels };
}

module.exports = async function retryCompare (options) {
  const {
    captureScreenshot,
    refPage, testPage,
    selector, selectorMap, viewport, config, scenario,
    initialRefBuffer, initialTestBuffer,
    refBrowserOrContext, testBrowserOrContext, engineScriptsPath,
    preparePage: preparePageOverride
  } = options;

  const preparePage = preparePageOverride || defaultPreparePage;

  const maxRetries = scenario.compareRetries != null
    ? scenario.compareRetries
    : (config.compareRetries != null ? config.compareRetries : 0);
  const retryDelayMs = scenario.compareRetryDelay != null
    ? scenario.compareRetryDelay
    : (config.compareRetryDelay != null ? config.compareRetryDelay : 5000);
  const maxNumDiffPixels = scenario.maxNumDiffPixels != null
    ? scenario.maxNumDiffPixels
    : (config.maxNumDiffPixels != null ? config.maxNumDiffPixels : 0);

  const refScreenshots = [initialRefBuffer];
  const testScreenshots = [initialTestBuffer];

  // Track the closest overall match for the final composite diff
  let overallLeastDiff = Infinity;
  let overallBestRef = initialRefBuffer;
  let overallBestTest = initialTestBuffer;
  let overallBestDiffPng = null;

  // Initial comparison to track best diff
  const initialResult = compareBuffers(initialRefBuffer, initialTestBuffer, { threshold: 0.2 });
  overallLeastDiff = initialResult.numDiffPixels;
  overallBestDiffPng = initialResult.diffPng;

  for (let retry = 0; retry < maxRetries; retry++) {
    // Linear backoff: 5s, 10s, 15s, ...
    const delay = retryDelayMs * (retry + 1);
    logger.log(`Retry ${retry + 1}/${maxRetries} for "${scenario.label}" [${selector}] - chilling for ${delay}ms`);
    await new Promise(function (resolve) { setTimeout(resolve, delay); });

    // Reset viewport to original dimensions before re-navigation.
    // captureScreenshot may expand the viewport for element bounding boxes,
    // and page.goto() does NOT reset it — causing dimension mismatches and
    // false diff pixels from transparent padding in compareBuffers.
    const VP_W = viewport.width || viewport.viewport.width;
    const VP_H = viewport.height || viewport.viewport.height;
    const setVPRef = refPage.setViewport || refPage.setViewportSize;
    const setVPTest = testPage.setViewport || testPage.setViewportSize;
    await Promise.all([
      setVPRef.call(refPage, { width: VP_W, height: VP_H }),
      setVPTest.call(testPage, { width: VP_W, height: VP_H })
    ]);

    // Re-navigate and re-prepare both pages before re-capturing
    logger.log(`Re-navigating both pages for retry ${retry + 1}...`);
    await Promise.all([
      preparePage(testPage, scenario.url, scenario, viewport, config, false, testBrowserOrContext, engineScriptsPath),
      preparePage(refPage, scenario.referenceUrl, scenario, viewport, config, true, refBrowserOrContext, engineScriptsPath)
    ]);

    // Step 1: Re-capture from test page, compare against all reference screenshots
    const newTestBuffer = await captureScreenshot(testPage, selector, selectorMap, viewport, config);
    if (newTestBuffer) {
      testScreenshots.push(newTestBuffer);

      const testMatch = tryMatchAgainstAll(newTestBuffer, refScreenshots, maxNumDiffPixels);
      if (testMatch.pass) {
        logger.log(`Match found on retry ${retry + 1} (test vs reference[${testMatch.matchIndex}])`);
        return { pass: true, refBuffer: refScreenshots[testMatch.matchIndex], testBuffer: newTestBuffer };
      }

      // Track closest match
      if (testMatch.leastDiffPixels < overallLeastDiff) {
        overallLeastDiff = testMatch.leastDiffPixels;
        overallBestRef = refScreenshots[testMatch.bestIndex];
        overallBestTest = newTestBuffer;
        overallBestDiffPng = testMatch.bestResult.diffPng;
      }
    }

    // Step 2: Re-capture from reference page, compare against all test screenshots
    const newRefBuffer = await captureScreenshot(refPage, selector, selectorMap, viewport, config);
    if (newRefBuffer) {
      refScreenshots.push(newRefBuffer);

      const refMatch = tryMatchAgainstAll(newRefBuffer, testScreenshots, maxNumDiffPixels);
      if (refMatch.pass) {
        logger.log(`Match found on retry ${retry + 1} (reference vs test[${refMatch.matchIndex}])`);
        return { pass: true, refBuffer: newRefBuffer, testBuffer: testScreenshots[refMatch.matchIndex] };
      }

      // Track closest match
      if (refMatch.leastDiffPixels < overallLeastDiff) {
        overallLeastDiff = refMatch.leastDiffPixels;
        overallBestRef = newRefBuffer;
        overallBestTest = testScreenshots[refMatch.bestIndex];
        overallBestDiffPng = refMatch.bestResult.diffPng;
      }
    }
  }

  // All retries exhausted — save composite diff image
  logger.log(`All ${maxRetries} retries exhausted for "${scenario.label}" [${selector}]. Least diff pixels: ${overallLeastDiff}`);

  let compositeBuffer = null;
  if (overallBestDiffPng) {
    const refPng = PNG.sync.read(overallBestRef);
    const testPng = PNG.sync.read(overallBestTest);
    const compositePng = createCompositeImage([refPng, overallBestDiffPng, testPng]);
    compositeBuffer = PNG.sync.write(compositePng, { filterType: 4 });
  }

  return {
    pass: false,
    refBuffer: overallBestRef,
    testBuffer: overallBestTest,
    compositeBuffer
  };
};
