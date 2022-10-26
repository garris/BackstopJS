const puppeteer = require('puppeteer');

const fs = require('./fs');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const ensureDirectoryPath = require('./ensureDirectoryPath');
const injectBackstopTools = require('../../capture/backstopTools.js');
const engineTools = require('./engineTools');

const MIN_CHROME_VERSION = 62;
const TEST_TIMEOUT = 60000;
const DEFAULT_FILENAME_TEMPLATE = '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';
const DEFAULT_BITMAPS_TEST_DIR = 'bitmaps_test';
const DEFAULT_BITMAPS_REFERENCE_DIR = 'bitmaps_reference';
const SELECTOR_NOT_FOUND_PATH = '/capture/resources/notFound.png';
const HIDDEN_SELECTOR_PATH = '/capture/resources/notVisible.png';
const ERROR_SELECTOR_PATH = '/capture/resources/unexpectedErrorSm.png';
const BODY_SELECTOR = 'body';
const DOCUMENT_SELECTOR = 'document';
const NOCLIP_SELECTOR = 'body:noclip';
const VIEWPORT_SELECTOR = 'viewport';

module.exports = function (args) {
  const scenario = args.scenario;
  const viewport = args.viewport;
  const config = args.config;
  const scenarioLabelSafe = engineTools.makeSafe(scenario.label);
  const variantOrScenarioLabelSafe = scenario._parent ? engineTools.makeSafe(scenario._parent.label) : scenarioLabelSafe;

  config._bitmapsTestPath = config.paths.bitmaps_test || DEFAULT_BITMAPS_TEST_DIR;
  config._bitmapsReferencePath = config.paths.bitmaps_reference || DEFAULT_BITMAPS_REFERENCE_DIR;
  config._fileNameTemplate = config.fileNameTemplate || DEFAULT_FILENAME_TEMPLATE;
  config._outputFileFormatSuffix = '.' + ((config.outputFormat && config.outputFormat.match(/jpg|jpeg/)) || 'png');
  config._configId = config.id || engineTools.genHash(config.backstopConfigFileName);

  const logger = {
    logged: []
  };
  Object.assign(logger, {
    error: loggerAction.bind(logger, 'error'),
    warn: loggerAction.bind(logger, 'warn'),
    log: loggerAction.bind(logger, 'log'),
    info: loggerAction.bind(logger, 'info')
  });

  return processScenarioView(scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, logger);
};

function loggerAction (action, color, message, ...rest) {
  this.logged.push([action, color, message.toString(), JSON.stringify(rest)]);
  console[action](chalk[color](message), ...rest);
}

async function processScenarioView (scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, logger) {
  if (!config.paths) {
    config.paths = {};
  }

  if (typeof viewport.label !== 'string') {
    viewport.label = viewport.name || '';
  }

  const engineScriptsPath = config.env.engine_scripts || config.env.engine_scripts_default;
  const isReference = config.isReference;

  const VP_W = viewport.width || viewport.viewport.width;
  const VP_H = viewport.height || viewport.viewport.height;

  const puppeteerArgs = Object.assign(
    {},
    {
      ignoreHTTPSErrors: true,
      headless: !config.debugWindow
    },
    config.engineOptions
  );

  const browser = await puppeteer.launch(puppeteerArgs);
  const page = await browser.newPage();

  await page.setViewport({ width: VP_W, height: VP_H });
  page.setDefaultNavigationTimeout(engineTools.getEngineOption(config, 'waitTimeout', TEST_TIMEOUT));

  if (isReference) {
    logger.log('blue', 'CREATING NEW REFERENCE FILE');
  }

  // --- set up console output and ready event ---
  const readyEvent = scenario.readyEvent || config.readyEvent;
  const readyTimeout = scenario.readyTimeout || config.readyTimeout || 30000;
  let readyResolve, readyPromise, readyTimeoutTimer;
  if (readyEvent) {
    readyPromise = new Promise(resolve => {
      readyResolve = resolve;
      // fire the ready event after the readyTimeout
      readyTimeoutTimer = setTimeout(() => {
        logger.error('red', `ReadyEvent not detected within readyTimeout limit. (${readyTimeout} ms)`, scenario.url);
        resolve();
      }, readyTimeout);
    });
  }

  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i) {
      const line = msg.args()[i];
      logger.log('reset', `Browser Console Log ${i}: ${line}`);
      if (readyEvent && new RegExp(readyEvent).test(line)) {
        readyResolve();
      }
    }
  });

  const chromeVersion = await page.evaluate(_ => {
    const v = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return v ? parseInt(v[2], 10) : 0;
  });

  if (chromeVersion < MIN_CHROME_VERSION) {
    logger.warn('reset', `***WARNING! CHROME VERSION ${MIN_CHROME_VERSION} OR GREATER IS REQUIRED. PLEASE UPDATE YOUR CHROME APP!***`);
  }

  let result;
  const puppetCommands = async () => {
    // --- BEFORE SCRIPT ---
    const onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
    if (onBeforeScript) {
      const beforeScriptPath = path.resolve(engineScriptsPath, onBeforeScript);
      if (fs.existsSync(beforeScriptPath)) {
        await require(beforeScriptPath)(page, scenario, viewport, isReference, browser, config);
      } else {
        logger.warn('reset', 'WARNING: script not found: ' + beforeScriptPath);
      }
    }

    //  --- OPEN URL ---
    let url = scenario.url;
    if (isReference && scenario.referenceUrl) {
      url = scenario.referenceUrl;
    }

    const gotoParameters = scenario?.engineOptions?.gotoParameters || config?.engineOptions?.gotoParameters || {};
    await page.goto(translateUrl(url, logger), gotoParameters);

    await injectBackstopTools(page);

    //  --- WAIT FOR READY EVENT ---
    if (readyEvent) {
      await page.evaluate(`window._readyEvent = '${readyEvent}'`);

      await readyPromise;

      clearTimeout(readyTimeoutTimer);

      // can't use logger here -- this executes on the page
      await page.evaluate(_ => console.info('readyEvent ok'));
    }

    // --- WAIT FOR SELECTOR ---
    if (scenario.readySelector) {
      await page.waitForSelector(scenario.readySelector, {
        timeout: readyTimeout
      });
    }
    //

    // --- DELAY ---
    if (scenario.delay > 0) {
      await page.waitForTimeout(scenario.delay);
    }

    // --- REMOVE SELECTORS ---
    if (_.has(scenario, 'removeSelectors')) {
      const removeSelectors = async () => {
        return Promise.all(
          scenario.removeSelectors.map(async (selector) => {
            await page
              .evaluate((sel) => {
                document.querySelectorAll(sel).forEach(s => {
                  s.style.cssText = 'display: none !important;';
                  s.classList.add('__86d');
                });
              }, selector);
          })
        );
      };

      await removeSelectors();
    }

    //  --- ON READY SCRIPT ---
    const onReadyScript = scenario.onReadyScript || config.onReadyScript;
    if (onReadyScript) {
      const readyScriptPath = path.resolve(engineScriptsPath, onReadyScript);
      if (fs.existsSync(readyScriptPath)) {
        await require(readyScriptPath)(page, scenario, viewport, isReference, browser, config);
      } else {
        logger.warn('reset', 'WARNING: script not found: ' + readyScriptPath);
      }
    }

    // reinstall tools in case onReadyScript has loaded a new URL.
    await injectBackstopTools(page);

    // --- HIDE SELECTORS ---
    if (_.has(scenario, 'hideSelectors')) {
      const hideSelectors = async () => {
        return Promise.all(
          scenario.hideSelectors.map(async (selector) => {
            await page
              .evaluate((sel) => {
                document.querySelectorAll(sel).forEach(s => {
                  s.style.visibility = 'hidden';
                });
              }, selector);
          })
        );
      };
      await hideSelectors();
    }

    // --- HANDLE NO-SELECTORS ---
    if (!_.has(scenario, 'selectors') || !scenario.selectors.length) {
      scenario.selectors = [DOCUMENT_SELECTOR];
    }

    await page.evaluate(`window._selectorExpansion = '${scenario.selectorExpansion}'`);
    await page.evaluate(`window._backstopSelectors = '${scenario.selectors}'`);
    result = await page.evaluate(() => {
      if (window._selectorExpansion.toString() === 'true') {
        window._backstopSelectorsExp = window._backstopTools.expandSelectors(window._backstopSelectors);
      } else {
        window._backstopSelectorsExp = window._backstopSelectors;
      }
      if (!Array.isArray(window._backstopSelectorsExp)) {
        window._backstopSelectorsExp = window._backstopSelectorsExp.split(',');
      }
      window._backstopSelectorsExpMap = window._backstopSelectorsExp.reduce((acc, selector) => {
        acc[selector] = {
          exists: window._backstopTools.exists(selector),
          isVisible: window._backstopTools.isVisible(selector)
        };
        return acc;
      }, {});
      return {
        backstopSelectorsExp: window._backstopSelectorsExp,
        backstopSelectorsExpMap: window._backstopSelectorsExpMap
      };
    });
  };

  let error;
  await puppetCommands().catch(e => {
    logger.log('red', `Puppeteer encountered an error while running scenario "${scenario.label}"`);
    logger.log('red', e);
    error = e;
  });

  let compareConfig;
  if (!error) {
    try {
      compareConfig = await delegateSelectors(
        page,
        browser,
        scenario,
        viewport,
        variantOrScenarioLabelSafe,
        scenarioLabelSafe,
        config,
        result.backstopSelectorsExp,
        result.backstopSelectorsExpMap,
        logger
      );
    } catch (e) {
      error = e;
    }
  } else {
    await browser.close();
  }

  if (error) {
    const testPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, 0, `${scenario.selectors.join('__')}`);
    const filePath = config.isReference ? testPair.reference : testPair.test;
    const logFilePath = config.isReference ? testPair.referenceLog : testPair.testLog;
    testPair.engineErrorMsg = error.message;

    compareConfig = {
      testPairs: [testPair]
    };
    await writeScenarioLogs(config, logFilePath, logger);
    await fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
  }

  return Promise.resolve(compareConfig);
}

// TODO: Should be in engineTools
async function delegateSelectors (
  page,
  browser,
  scenario,
  viewport,
  variantOrScenarioLabelSafe,
  scenarioLabelSafe,
  config,
  selectors,
  selectorMap,
  logger
) {
  const compareConfig = { testPairs: [] };
  let captureDocument = false;
  let captureViewport = false;
  const captureList = [];
  const captureJobs = [];

  selectors.forEach(function (selector, selectorIndex) {
    const testPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, selectorIndex, selector);
    const filePath = config.isReference ? testPair.reference : testPair.test;
    const logFilePath = config.isReference ? testPair.referenceLog : testPair.testLog;

    if (!config.isReference) {
      compareConfig.testPairs.push(testPair);
    }

    selectorMap[selector].filePath = filePath;
    selectorMap[selector].logFilePath = logFilePath;
    if (selector === BODY_SELECTOR || selector === DOCUMENT_SELECTOR) {
      captureDocument = selector;
    } else if (selector === VIEWPORT_SELECTOR) {
      captureViewport = selector;
    } else {
      captureList.push(selector);
    }
  });

  if (captureDocument) {
    captureJobs.push(function () { return captureScreenshot(page, browser, captureDocument, selectorMap, config, [], viewport, logger); });
  }
  // TODO: push captureViewport into captureList (instead of calling captureScreenshot()) to improve perf.
  if (captureViewport) {
    captureJobs.push(function () { return captureScreenshot(page, browser, captureViewport, selectorMap, config, [], viewport, logger); });
  }
  if (captureList.length) {
    captureJobs.push(function () { return captureScreenshot(page, browser, null, selectorMap, config, captureList, viewport, logger); });
  }

  return new Promise(function (resolve, reject) {
    let job = null;
    const errors = [];
    const next = function () {
      if (captureJobs.length === 0) {
        if (errors.length === 0) {
          resolve();
        } else {
          reject(errors);
        }
        return;
      }
      job = captureJobs.shift();
      job().catch(function (e) {
        logger.log('reset', e);
        errors.push(e);
      }).then(function () {
        next();
      });
    };
    next();
  }).then(async () => {
    logger.log('green', 'x Close Browser');
    await browser.close();
  }).catch(async (err) => {
    logger.log('red', err);
    await browser.close();
  }).then(_ => compareConfig);
}

async function captureScreenshot (page, browser, selector, selectorMap, config, selectors, viewport, logger) {
  let filePath, logFilePath;
  const fullPage = (selector === NOCLIP_SELECTOR || selector === DOCUMENT_SELECTOR);
  if (selector) {
    filePath = selectorMap[selector].filePath;
    logFilePath = selectorMap[selector].logFilePath;
    ensureDirectoryPath(filePath); // logs in same dir

    try {
      await page.screenshot({
        path: filePath,
        fullPage
      });
      await writeScenarioLogs(config, logFilePath, logger);
    } catch (e) {
      logger.log('red', 'Error capturing..', e);
      await writeScenarioLogs(config, logFilePath, logger);
      return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
    }
  } else {
    // OTHER-SELECTOR screenshot
    const selectorShot = async (s, path, logFilePath) => {
      const el = await page.$(s);
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          // Resize the viewport to screenshot elements outside of the viewport
          if (config.useBoundingBoxViewportForSelectors !== false) {
            const bodyHandle = await page.$('body');
            const boundingBox = await bodyHandle.boundingBox();

            await page.setViewport({
              width: Math.max(viewport.width, Math.ceil(boundingBox.width)),
              height: Math.max(viewport.height, Math.ceil(boundingBox.height))
            });
          }

          const type = config.puppeteerOffscreenCaptureFix ? page : el;
          const params = config.puppeteerOffscreenCaptureFix
            ? {
                captureBeyondViewport: false,
                path,
                clip: box
              }
            : { captureBeyondViewport: false, path };

          await type.screenshot(params);
          await writeScenarioLogs(config, logFilePath, logger);
        } else {
          logger.log('yellow', `Element not visible for capturing: ${s}`);
          await writeScenarioLogs(config, logFilePath, logger);
          return fs.copy(config.env.backstop + HIDDEN_SELECTOR_PATH, path);
        }
      } else {
        logger.log('magenta', `Element not found for capturing: ${s}`);
        await writeScenarioLogs(config, logFilePath, logger);
        return fs.copy(config.env.backstop + SELECTOR_NOT_FOUND_PATH, path);
      }
    };

    const selectorsShot = async () => {
      for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        filePath = selectorMap[selector].filePath;
        logFilePath = selectorMap[selector].logFilePath;
        ensureDirectoryPath(filePath);
        try {
          await selectorShot(selector, filePath, logFilePath);
        } catch (e) {
          logger.log('red', `Error capturing Element ${selector}`, e);
          await writeScenarioLogs(config, logFilePath, logger);
          return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
        }
      }
    };
    await selectorsShot();
  }
}

// handle relative file name
function translateUrl (url, logger) {
  const RE = /^[./]/;
  if (RE.test(url)) {
    const fileUrl = 'file://' + path.join(process.cwd(), url);
    logger.log('reset', 'Relative filename detected -- translating to ' + fileUrl);
    return fileUrl;
  } else {
    return url;
  }
}

function writeScenarioLogs (config, logFilePath, logger) {
  if (config.scenarioLogsInReports) {
    return fs.writeFile(logFilePath, JSON.stringify(logger.logged));
  } else {
    return Promise.resolve(true);
  }
}
