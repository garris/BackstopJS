const puppeteer = require('puppeteer');

const fs = require('./fs');
const chalk = require('chalk');
const ensureDirectoryPath = require('./ensureDirectoryPath');
const engineTools = require('./engineTools');
const { compareBuffers } = require('./compare/pixelmatch-inline');
const retryCompare = require('./retryCompare');
const preparePage = require('./preparePage');

const TEST_TIMEOUT = 60000;
const DEFAULT_FILENAME_TEMPLATE = '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';
const DEFAULT_BITMAPS_TEST_DIR = 'bitmaps_test';
const DEFAULT_BITMAPS_REFERENCE_DIR = 'bitmaps_reference';
const SELECTOR_NOT_FOUND_PATH = '/capture/resources/notFound.png';
const ERROR_SELECTOR_PATH = '/capture/resources/unexpectedErrorSm.png';
const BODY_SELECTOR = 'body';
const DOCUMENT_SELECTOR = 'document';
const NOCLIP_SELECTOR = 'body:noclip';
const VIEWPORT_SELECTOR = 'viewport';

function loggerAction (action, color, message) {
  const rest = Array.prototype.slice.call(arguments, 3);
  this.logged.push([action, color, message.toString(), JSON.stringify(rest)]);
  console[action](chalk[color](message), ...rest);
}

function createLogger () {
  const logger = { logged: [] };
  Object.assign(logger, {
    error: loggerAction.bind(logger, 'error'),
    warn: loggerAction.bind(logger, 'warn'),
    log: loggerAction.bind(logger, 'log'),
    info: loggerAction.bind(logger, 'info')
  });
  return logger;
}

/**
 * Capture a single selector to a PNG buffer (no disk write).
 */
async function captureScreenshot (page, selector, selectorMap, viewport, config) {
  const fullPage = (selector === NOCLIP_SELECTOR || selector === DOCUMENT_SELECTOR);

  if (selector === BODY_SELECTOR || selector === DOCUMENT_SELECTOR || selector === NOCLIP_SELECTOR) {
    return await page.screenshot({ fullPage });
  } else if (selector === VIEWPORT_SELECTOR) {
    return await page.screenshot();
  } else {
    // Element selector
    const el = await page.$(selector);
    if (el) {
      const box = await el.boundingBox();
      if (box) {
        if (config.useBoundingBoxViewportForSelectors !== false) {
          const bodyHandle = await page.$('body');
          const boundingBox = await bodyHandle.boundingBox();
          // Use setViewport for Puppeteer, setViewportSize for Playwright
          const setVP = page.setViewport || page.setViewportSize;
          await setVP.call(page, {
            width: Math.max(viewport.width || viewport.viewport.width, Math.ceil(boundingBox.width)),
            height: Math.max(viewport.height || viewport.viewport.height, Math.ceil(boundingBox.height))
          });
        }

        const screenshotOptions = { clip: box };
        if (page.setViewport) {
          screenshotOptions.captureBeyondViewport = false;
        }
        return await page.screenshot(screenshotOptions);
      }
    }
    return null; // selector not found or not visible
  }
}

function writeScenarioLogs (config, logFilePath, logger) {
  if (config.scenarioLogsInReports) {
    return fs.writeFile(logFilePath, JSON.stringify(logger.logged));
  }
  return Promise.resolve(true);
}

/**
 * Core comparison logic shared between Puppeteer and Playwright.
 */
async function processCompareView (scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, refPage, testPage, refBrowserOrContext, testBrowserOrContext, logger) {
  const { scenarioDefaults = {} } = config;
  scenario = { ...scenarioDefaults, ...scenario };

  if (!config.paths) {
    config.paths = {};
  }

  if (typeof viewport.label !== 'string') {
    viewport.label = viewport.name || '';
  }

  config._bitmapsTestPath = config.paths.bitmaps_test || DEFAULT_BITMAPS_TEST_DIR;
  config._bitmapsReferencePath = config.paths.bitmaps_reference || DEFAULT_BITMAPS_REFERENCE_DIR;
  config._fileNameTemplate = config.fileNameTemplate || DEFAULT_FILENAME_TEMPLATE;
  config._outputFileFormatSuffix = '.' + ((config.outputFormat && config.outputFormat.match(/jpg|jpeg/)) || 'png');
  config._configId = config.id || engineTools.genHash(config.backstopConfigFileName);

  const engineScriptsPath = config.env.engine_scripts || config.env.engine_scripts_default;
  const VP_W = viewport.width || viewport.viewport.width;
  const VP_H = viewport.height || viewport.viewport.height;

  // Set viewport on both pages
  const setVPRef = refPage.setViewport || refPage.setViewportSize;
  const setVPTest = testPage.setViewport || testPage.setViewportSize;
  await Promise.all([
    setVPRef.call(refPage, { width: VP_W, height: VP_H }),
    setVPTest.call(testPage, { width: VP_W, height: VP_H })
  ]);

  const navTimeout = engineTools.getEngineOption(config, 'waitTimeout', TEST_TIMEOUT);
  refPage.setDefaultNavigationTimeout(navTimeout);
  testPage.setDefaultNavigationTimeout(navTimeout);

  logger.log('blue', 'LIVE COMPARE: opening reference (' + scenario.referenceUrl + ') and test (' + scenario.url + ') simultaneously');

  // Prepare both pages in parallel
  const [refResult, testResult] = await Promise.all([
    preparePage(refPage, scenario.referenceUrl, scenario, viewport, config, true, refBrowserOrContext, engineScriptsPath),
    preparePage(testPage, scenario.url, scenario, viewport, config, false, testBrowserOrContext, engineScriptsPath)
  ]);

  // Use selectors from test page (the main subject), fall back to reference
  const selectors = testResult.backstopSelectorsExp;
  const testSelectorMap = testResult.backstopSelectorsExpMap;
  const refSelectorMap = refResult.backstopSelectorsExpMap;

  const compareConfig = { testPairs: [] };
  const maxNumDiffPixels = scenario.maxNumDiffPixels != null
    ? scenario.maxNumDiffPixels
    : (config.maxNumDiffPixels != null ? config.maxNumDiffPixels : 0);

  for (let selectorIndex = 0; selectorIndex < selectors.length; selectorIndex++) {
    const selector = selectors[selectorIndex];
    const testPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, selectorIndex, selector);

    // Assign file paths to selectorMap entries
    if (testSelectorMap[selector]) {
      testSelectorMap[selector].filePath = testPair.test;
    }
    if (refSelectorMap[selector]) {
      refSelectorMap[selector].filePath = testPair.reference;
    }

    // Capture both screenshots to buffers
    const refBuffer = await captureScreenshot(refPage, selector, refSelectorMap, viewport, config);
    const testBuffer = await captureScreenshot(testPage, selector, testSelectorMap, viewport, config);

    if (!refBuffer || !testBuffer) {
      // Selector not found on one or both pages
      logger.log('magenta', 'Selector "' + selector + '" not found on ' + (!refBuffer ? 'reference' : 'test') + ' page');
      ensureDirectoryPath(testPair.reference);
      ensureDirectoryPath(testPair.test);

      if (refBuffer) {
        await fs.writeFile(testPair.reference, refBuffer);
      } else {
        await fs.copy(config.env.backstop + SELECTOR_NOT_FOUND_PATH, testPair.reference);
      }
      if (testBuffer) {
        await fs.writeFile(testPair.test, testBuffer);
      } else {
        await fs.copy(config.env.backstop + SELECTOR_NOT_FOUND_PATH, testPair.test);
      }

      compareConfig.testPairs.push(testPair);
      continue;
    }

    // Inline pixelmatch comparison
    const matchResult = compareBuffers(refBuffer, testBuffer, { threshold: 0.2 });

    if (matchResult.numDiffPixels <= maxNumDiffPixels) {
      // Pass — save both screenshots
      logger.log('green', 'PASS: "' + scenario.label + '" [' + selector + '] (' + matchResult.numDiffPixels + ' diff pixels)');
      ensureDirectoryPath(testPair.reference);
      ensureDirectoryPath(testPair.test);
      await Promise.all([
        fs.writeFile(testPair.reference, refBuffer),
        fs.writeFile(testPair.test, testBuffer)
      ]);
      compareConfig.testPairs.push(testPair);
      continue;
    }

    // Mismatch — enter retry loop
    logger.log('yellow', 'MISMATCH: "' + scenario.label + '" [' + selector + '] (' + matchResult.numDiffPixels + ' diff pixels). Entering retry loop...');

    const retryResult = await retryCompare({
      captureScreenshot,
      refPage,
      testPage,
      selector,
      selectorMap: testSelectorMap,
      viewport,
      config,
      scenario,
      initialRefBuffer: refBuffer,
      initialTestBuffer: testBuffer,
      refBrowserOrContext,
      testBrowserOrContext,
      engineScriptsPath
    });

    // Save the best screenshots to disk
    ensureDirectoryPath(testPair.reference);
    ensureDirectoryPath(testPair.test);
    await Promise.all([
      fs.writeFile(testPair.reference, retryResult.refBuffer),
      fs.writeFile(testPair.test, retryResult.testBuffer)
    ]);

    // Save composite diff image if failed
    if (!retryResult.pass && retryResult.compositeBuffer) {
      const diffPath = testPair.test.replace(/\.png$/, '_composite_diff.png');
      ensureDirectoryPath(diffPath);
      await fs.writeFile(diffPath, retryResult.compositeBuffer);
    }

    if (retryResult.pass) {
      logger.log('green', 'PASS after retries: "' + scenario.label + '" [' + selector + ']');
    } else {
      logger.log('red', 'FAIL after retries: "' + scenario.label + '" [' + selector + ']');
    }

    compareConfig.testPairs.push(testPair);
  }

  // Write scenario logs
  if (selectors.length > 0) {
    const firstSelector = selectors[0];
    const logTestPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, 0, firstSelector);
    await writeScenarioLogs(config, logTestPair.testLog, logger);
    await writeScenarioLogs(config, logTestPair.referenceLog, logger);
  }

  return compareConfig;
}

// ── Puppeteer entry point ──────────────────────────────────────────

module.exports.puppet = async function runComparePuppet ({ scenario, viewport, config }) {
  const scenarioLabelSafe = engineTools.makeSafe(scenario.label);
  const variantOrScenarioLabelSafe = scenario._parent ? engineTools.makeSafe(scenario._parent.label) : scenarioLabelSafe;
  const logger = createLogger();

  const puppeteerArgs = Object.assign(
    {},
    {
      ignoreHTTPSErrors: true,
      headless: config.debugWindow ? false : (config?.engineOptions?.headless ?? 'new')
    },
    config.engineOptions
  );

  // Launch two separate browser instances
  const refBrowser = await puppeteer.launch(puppeteerArgs);
  const testBrowser = await puppeteer.launch(puppeteerArgs);
  const refPage = await refBrowser.newPage();
  const testPage = await testBrowser.newPage();

  let compareConfig;
  let error;

  try {
    compareConfig = await processCompareView(
      scenario, variantOrScenarioLabelSafe, scenarioLabelSafe,
      viewport, config, refPage, testPage, refBrowser, testBrowser, logger
    );
  } catch (e) {
    logger.log('red', 'Error during live compare for "' + scenario.label + '"');
    logger.log('red', e.toString());
    error = e;
  } finally {
    logger.log('green', 'x Close Browsers');
    await refBrowser.close();
    await testBrowser.close();
  }

  if (error) {
    config._bitmapsTestPath = config.paths.bitmaps_test || DEFAULT_BITMAPS_TEST_DIR;
    config._bitmapsReferencePath = config.paths.bitmaps_reference || DEFAULT_BITMAPS_REFERENCE_DIR;
    config._fileNameTemplate = config.fileNameTemplate || DEFAULT_FILENAME_TEMPLATE;
    config._outputFileFormatSuffix = '.' + ((config.outputFormat && config.outputFormat.match(/jpg|jpeg/)) || 'png');
    config._configId = config.id || engineTools.genHash(config.backstopConfigFileName);

    const testPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, 0, (scenario.selectors || ['document']).join('__'));
    testPair.engineErrorMsg = error.message;

    compareConfig = { testPairs: [testPair] };
    const filePath = testPair.test;
    ensureDirectoryPath(filePath);
    await fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
    // Also copy error image to reference path so the report can find it
    ensureDirectoryPath(testPair.reference);
    await fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, testPair.reference);
  }

  return Promise.resolve(compareConfig);
};

// ── Playwright entry point ─────────────────────────────────────────

module.exports.playwright = async function runComparePlaywright ({ scenario, viewport, config, _playwrightBrowser: browser }) {
  const scenarioLabelSafe = engineTools.makeSafe(scenario.label);
  const variantOrScenarioLabelSafe = scenario._parent ? engineTools.makeSafe(scenario._parent.label) : scenarioLabelSafe;
  const logger = createLogger();

  const { engineOptions = {} } = config;
  const ignoreHTTPSErrors = engineOptions.ignoreHTTPSErrors !== undefined ? engineOptions.ignoreHTTPSErrors : true;
  const storageState = engineOptions.storageState || {};

  // Create two separate browser contexts
  const refContext = await browser.newContext({ ignoreHTTPSErrors, storageState });
  const testContext = await browser.newContext({ ignoreHTTPSErrors, storageState });
  const refPage = await refContext.newPage();
  const testPage = await testContext.newPage();

  let compareConfig;
  let error;

  try {
    compareConfig = await processCompareView(
      scenario, variantOrScenarioLabelSafe, scenarioLabelSafe,
      viewport, config, refPage, testPage, refContext, testContext, logger
    );
  } catch (e) {
    logger.log('red', 'Error during live compare for "' + scenario.label + '"');
    logger.log('red', e.toString());
    error = e;
  } finally {
    logger.log('green', 'x Close Browser Contexts');
    await refContext.close();
    await testContext.close();
  }

  if (error) {
    config._bitmapsTestPath = config.paths.bitmaps_test || DEFAULT_BITMAPS_TEST_DIR;
    config._bitmapsReferencePath = config.paths.bitmaps_reference || DEFAULT_BITMAPS_REFERENCE_DIR;
    config._fileNameTemplate = config.fileNameTemplate || DEFAULT_FILENAME_TEMPLATE;
    config._outputFileFormatSuffix = '.' + ((config.outputFormat && config.outputFormat.match(/jpg|jpeg/)) || 'png');
    config._configId = config.id || engineTools.genHash(config.backstopConfigFileName);

    const testPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, 0, (scenario.selectors || ['document']).join('__'));
    testPair.engineErrorMsg = error.message;

    compareConfig = { testPairs: [testPair] };
    const filePath = testPair.test;
    ensureDirectoryPath(filePath);
    await fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
    ensureDirectoryPath(testPair.reference);
    await fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, testPair.reference);
  }

  return Promise.resolve(compareConfig);
};
