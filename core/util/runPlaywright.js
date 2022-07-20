const playwright = require('playwright');

const fs = require('./fs');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const ensureDirectoryPath = require('./ensureDirectoryPath');
const injectBackstopTools = require('../../capture/backstopTools.js');
const engineTools = require('./engineTools');

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

module.exports.createPlaywrightBrowser = async function (config) {
  console.log('Creating Browser');
  let browserChoice = config.engineOptions.browser;
  if (!browserChoice) {
    console.warn(chalk.yellow('No Playwright browser specified, assuming Chromium.'));
    browserChoice = 'chromium';
  }

  if (!playwright[browserChoice]) {
    console.error(chalk.red(`Unsupported playwright browser "${browserChoice}"`));
    return;
  }

  const playwrightArgs = Object.assign(
    {},
    {
      headless: !config.debugWindow
    },
    config.engineOptions
  );
  return await playwright[browserChoice].launch(playwrightArgs);
};

module.exports.runPlaywright = function (args) {
  const scenario = args.scenario;
  const viewport = args.viewport;
  const config = args.config;
  const browser = args._playwrightBrowser;
  const scenarioLabelSafe = engineTools.makeSafe(scenario.label);
  const variantOrScenarioLabelSafe = scenario._parent ? engineTools.makeSafe(scenario._parent.label) : scenarioLabelSafe;

  config._bitmapsTestPath = config.paths.bitmaps_test || DEFAULT_BITMAPS_TEST_DIR;
  config._bitmapsReferencePath = config.paths.bitmaps_reference || DEFAULT_BITMAPS_REFERENCE_DIR;
  config._fileNameTemplate = config.fileNameTemplate || DEFAULT_FILENAME_TEMPLATE;
  config._outputFileFormatSuffix = '.' + ((config.outputFormat && config.outputFormat.match(/jpg|jpeg/)) || 'png');
  config._configId = config.id || engineTools.genHash(config.backstopConfigFileName);

  return processScenarioView(scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, browser);
};

module.exports.disposePlaywrightBrowser = async function (browser) {
  console.log('Disposing Browser');
  await browser.close();
};

async function processScenarioView (scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, browser) {
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

  const ignoreHTTPSErrors = config.engineOptions.ignoreHTTPSErrors ? config.engineOptions.ignoreHTTPSErrors : true;
  const storageState = config.engineOptions.storageState ? config.engineOptions.storageState : {};
  const browserContext = await browser.newContext({ ignoreHTTPSErrors, storageState });
  const page = await browserContext.newPage();

  await page.setViewportSize({ width: VP_W, height: VP_H });
  page.setDefaultNavigationTimeout(engineTools.getEngineOption(config, 'waitTimeout', TEST_TIMEOUT));

  if (isReference) {
    console.log(chalk.blue('CREATING NEW REFERENCE FILE'));
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
        console.error(chalk.red(`ReadyEvent not detected within readyTimeout limit. (${readyTimeout} ms)`), scenario.url);
        resolve();
      }, readyTimeout);
    });
  }

  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i) {
      const line = msg.args()[i];
      console.log(`Browser Console Log ${i}: ${line}`);
      if (readyEvent && new RegExp(readyEvent).test(line)) {
        readyResolve();
      }
    }
  });

  let result;
  const playwrightCommands = async () => {
    // --- BEFORE SCRIPT ---
    const onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
    if (onBeforeScript) {
      const beforeScriptPath = path.resolve(engineScriptsPath, onBeforeScript);
      if (fs.existsSync(beforeScriptPath)) {
        await require(beforeScriptPath)(page, scenario, viewport, isReference, browserContext, config);
      } else {
        console.warn('WARNING: script not found: ' + beforeScriptPath);
      }
    }

    //  --- OPEN URL ---
    let url = scenario.url;
    if (isReference && scenario.referenceUrl) {
      url = scenario.referenceUrl;
    }
    await page.goto(translateUrl(url));

    await injectBackstopTools(page);

    //  --- WAIT FOR READY EVENT ---
    if (readyEvent) {
      await page.evaluate(`window._readyEvent = '${readyEvent}'`);

      await readyPromise;

      clearTimeout(readyTimeoutTimer);

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
        await require(readyScriptPath)(page, scenario, viewport, isReference, browserContext, config);
      } else {
        console.warn('WARNING: script not found: ' + readyScriptPath);
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
  await playwrightCommands().catch(e => {
    console.log(chalk.red(`Playwright encountered an error while running scenario "${scenario.label}"`));
    console.log(chalk.red(e));
    error = e;
  });

  let compareConfig;
  if (!error) {
    try {
      compareConfig = await delegateSelectors(
        page,
        browserContext,
        scenario,
        viewport,
        variantOrScenarioLabelSafe,
        scenarioLabelSafe,
        config,
        result.backstopSelectorsExp,
        result.backstopSelectorsExpMap
      );
    } catch (e) {
      error = e;
    }
  } else {
    await browserContext.close();
  }

  if (error) {
    const testPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, 0, `${scenario.selectors.join('__')}`);
    const filePath = config.isReference ? testPair.reference : testPair.test;
    testPair.engineErrorMsg = error.message;

    compareConfig = {
      testPairs: [testPair]
    };
    await fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
  }

  return Promise.resolve(compareConfig);
}

// TODO: Should be in engineTools
async function delegateSelectors (
  page,
  browserContext,
  scenario,
  viewport,
  variantOrScenarioLabelSafe,
  scenarioLabelSafe,
  config,
  selectors,
  selectorMap
) {
  const compareConfig = { testPairs: [] };
  let captureDocument = false;
  let captureViewport = false;
  const captureList = [];
  const captureJobs = [];

  selectors.forEach(function (selector, selectorIndex) {
    const testPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, selectorIndex, selector);
    const filePath = config.isReference ? testPair.reference : testPair.test;

    if (!config.isReference) {
      compareConfig.testPairs.push(testPair);
    }

    selectorMap[selector].filePath = filePath;
    if (selector === BODY_SELECTOR || selector === DOCUMENT_SELECTOR) {
      captureDocument = selector;
    } else if (selector === VIEWPORT_SELECTOR) {
      captureViewport = selector;
    } else {
      captureList.push(selector);
    }
  });

  if (captureDocument) {
    captureJobs.push(function () { return captureScreenshot(page, browserContext, captureDocument, selectorMap, config, [], viewport); });
  }
  // TODO: push captureViewport into captureList (instead of calling captureScreenshot()) to improve perf.
  if (captureViewport) {
    captureJobs.push(function () { return captureScreenshot(page, browserContext, captureViewport, selectorMap, config, [], viewport); });
  }
  if (captureList.length) {
    captureJobs.push(function () { return captureScreenshot(page, browserContext, null, selectorMap, config, captureList, viewport); });
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
        console.log(e);
        errors.push(e);
      }).then(function () {
        next();
      });
    };
    next();
  }).then(async () => {
    console.log(chalk.green('x Close Browser'));
    await browserContext.close();
  }).catch(async (err) => {
    console.log(chalk.red(err));
    await browserContext.close();
  }).then(_ => compareConfig);
}

async function captureScreenshot (page, browserContext, selector, selectorMap, config, selectors, viewport) {
  let filePath;
  const fullPage = (selector === NOCLIP_SELECTOR || selector === DOCUMENT_SELECTOR);
  if (selector) {
    filePath = selectorMap[selector].filePath;
    ensureDirectoryPath(filePath);

    try {
      await page.screenshot({
        path: filePath,
        fullPage
      });
    } catch (e) {
      console.log(chalk.red('Error capturing..'), e);
      return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
    }
  } else {
    // OTHER-SELECTOR screenshot
    const selectorShot = async (s, path) => {
      const el = await page.$(s);
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          // Resize the viewport to screenshot elements outside of the viewport
          if (config.useBoundingBoxViewportForSelectors !== false) {
            const bodyHandle = await page.$('body');
            const boundingBox = await bodyHandle.boundingBox();

            await page.setViewportSize({
              width: Math.max(viewport.width, Math.ceil(boundingBox.width)),
              height: Math.max(viewport.height, Math.ceil(boundingBox.height))
            });
          }

          const type = el;
          const params = { captureBeyondViewport: false, path };

          await type.screenshot(params);
        } else {
          console.log(chalk.yellow(`Element not visible for capturing: ${s}`));
          return fs.copy(config.env.backstop + HIDDEN_SELECTOR_PATH, path);
        }
      } else {
        console.log(chalk.magenta(`Element not found for capturing: ${s}`));
        return fs.copy(config.env.backstop + SELECTOR_NOT_FOUND_PATH, path);
      }
    };

    const selectorsShot = async () => {
      for (let i = 0; i < selectors.length; i++) {
        const selector = selectors[i];
        filePath = selectorMap[selector].filePath;
        ensureDirectoryPath(filePath);
        try {
          await selectorShot(selector, filePath);
        } catch (e) {
          console.log(chalk.red(`Error capturing Element ${selector}`), e);
          return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
        }
      }
    };
    await selectorsShot();
  }
}

// handle relative file name
function translateUrl (url) {
  const RE = /^[./]/;
  if (RE.test(url)) {
    const fileUrl = 'file://' + path.join(process.cwd(), url);
    console.log('Relative filename detected -- translating to ' + fileUrl);
    return fileUrl;
  } else {
    return url;
  }
}
