const fs = require('./fs');
const _ = require('lodash');
const path = require('path');
const chalk = require('chalk');
const { Builder, until, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const engineTools = require('./engineTools');
const injectBackstopTools = require('../../capture/backstopToolsSelenium.js');
const ensureDirectoryPath = require('./ensureDirectoryPath');

const TEST_TIMEOUT = 120000;
const DEFAULT_FILENAME_TEMPLATE = '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';
const DEFAULT_BITMAPS_TEST_DIR = 'bitmaps_test';
const DEFAULT_BITMAPS_REFERENCE_DIR = 'bitmaps_reference';
const SELECTOR_NOT_FOUND_PATH = '/capture/resources/notFound.png';
const HIDDEN_SELECTOR_PATH = '/capture/resources/notVisible.png';
const ERROR_SELECTOR_PATH = '/capture/resources/unexpectedErrorSm.png';
const DOCUMENT_SELECTOR = 'document';
const BODY_SELECTOR = 'body';
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

async function captureScreenshot (driver, selector, selectorMap, config, selectors, viewport, logger) {
  let filePath, logFilePath;
  if (selector) {
    filePath = selectorMap[selector].filePath;
    logFilePath = selectorMap[selector].logFilePath;
    ensureDirectoryPath(filePath); // logs in same dir

    try {
      const screenshot = await driver.takeScreenshot();
      fs.writeFile(filePath, screenshot, 'base64');
      await writeScenarioLogs(config, logFilePath, logger);
    } catch (e) {
      logger.log('red', 'Error capturing..', e);
      await writeScenarioLogs(config, logFilePath, logger);
      return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
    }
  } else {
    // OTHER-SELECTOR screenshot
    const selectorShot = async (s, path, logFilePath) => {
      const el = await driver.findElement(By.css(s));
      if (el) {
        const box = await el.getRect();
        if (box) {
          // Resize the viewport to screenshot elements outside of the viewport
          if (config.useBoundingBoxViewportForSelectors !== false) {
            const bodyHandle = await driver.findElement(By.css('body'));
            const boundingBox = await bodyHandle.getRect();

            await driver.manage().window().setRect({
              width: Math.max(viewport.width, Math.ceil(boundingBox.width)),
              height: Math.max(viewport.height, Math.ceil(boundingBox.height))
            });
          }

          const type = config.puppeteerOffscreenCaptureFix ? driver : el;
          const screenshot = await type.takeScreenshot();
          fs.writeFile(filePath, screenshot, 'base64');
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

async function delegateSelectors (
  driver,
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
    captureJobs.push(function () { return captureScreenshot(driver, captureDocument, selectorMap, config, [], viewport, logger); });
  }
  // TODO: push captureViewport into captureList (instead of calling captureScreenshot()) to improve perf.
  if (captureViewport) {
    captureJobs.push(function () { return captureScreenshot(driver, captureViewport, selectorMap, config, [], viewport, logger); });
  }
  if (captureList.length) {
    captureJobs.push(function () { return captureScreenshot(driver, null, selectorMap, config, captureList, viewport, logger); });
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
    await driver.quit();
  }).catch(async (err) => {
    logger.log('red', err);
    await driver.quit();
  }).then(_ => compareConfig);
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

  const chromeOptions = new chrome.Options();
  config.engineOptions?.args?.forEach((arg) => {
    chromeOptions.addArguments(arg);
  });
  chromeOptions.windowSize({ width: parseInt(VP_W), height: parseInt(VP_H) });

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .usingServer('http://localhost:4444/wd/hub')
    .build();

  await driver.manage().setTimeouts({ pageLoad: engineTools.getEngineOption(config, 'waitTimeout', TEST_TIMEOUT) });

  if (isReference) {
    logger.log('blue', 'CREATING NEW REFERENCE FILE');
  }

  let result;
  const seleniumCommands = async () => {
    //  --- OPEN URL ---
    let url = scenario.url;
    if (isReference && scenario.referenceUrl) {
      url = scenario.referenceUrl;
    }
    await driver.get(translateUrl(url, logger));

    // --- BEFORE SCRIPT ---
    const onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
    if (onBeforeScript) {
      const beforeScriptPath = path.resolve(engineScriptsPath, onBeforeScript);
      if (fs.existsSync(beforeScriptPath)) {
        await require(beforeScriptPath)(driver, scenario, viewport, isReference, config);
      } else {
        logger.warn('reset', 'WARNING: script not found: ' + beforeScriptPath);
      }
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

    const logs = await driver.manage().logs().get('browser');
    logs.forEach((entry, i) => {
      logger.log('reset', `Browser Console Log ${i}:  ${entry.message}`);
      if (readyEvent && new RegExp(readyEvent).test(entry.message)) {
        readyResolve();
      }
    });

    await injectBackstopTools(driver);

    //  --- WAIT FOR READY EVENT ---
    if (readyEvent) {
      await driver.executeScript(`window._readyEvent = '${readyEvent}'`);

      await readyPromise;

      clearTimeout(readyTimeoutTimer);

      // can't use logger here -- this executes on the page
      await driver.executeScript(_ => console.info('readyEvent ok'));
    }

    // --- WAIT FOR SELECTOR ---
    if (scenario.readySelector) {
      await driver.wait(until.elementLocated(By.css(scenario.readySelector)), readyTimeout);
    }
    //

    // --- DELAY ---
    if (scenario.delay > 0) {
      await driver.sleep(scenario.delay);
    }

    // --- REMOVE SELECTORS ---
    if (_.has(scenario, 'removeSelectors')) {
      const removeSelectors = async () => {
        return Promise.all(
          scenario.removeSelectors.map(async (selector) => {
            await driver
              .executeScript((sel) => {
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
        await require(readyScriptPath)(driver, scenario, viewport, isReference, config);
      } else {
        logger.warn('reset', 'WARNING: script not found: ' + readyScriptPath);
      }
    }

    // reinstall tools in case onReadyScript has loaded a new URL.
    await injectBackstopTools(driver);

    // --- HIDE SELECTORS ---
    if (_.has(scenario, 'hideSelectors')) {
      const hideSelectors = async () => {
        return Promise.all(
          scenario.hideSelectors.map(async (selector) => {
            await driver
              .executeScript((sel) => {
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

    await driver.executeScript(`window._selectorExpansion = '${scenario.selectorExpansion}'`);
    await driver.executeScript(`window._backstopSelectors = '${scenario.selectors}'`);
    result = await driver.executeScript(() => {
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
  await seleniumCommands().catch(e => {
    logger.log('red', `Selenium encountered an error while running scenario "${scenario.label}"`);
    logger.log('red', e);
    error = e;
  });

  let compareConfig;
  if (!error) {
    try {
      compareConfig = await delegateSelectors(
        driver,
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
    await driver.quit();
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
