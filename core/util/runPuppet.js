const puppeteer = require('puppeteer');

const fs = require('./fs');
const path = require('path');
const chalk = require('chalk');
const ensureDirectoryPath = require('./ensureDirectoryPath');
const injectBackstopTools = require('../../capture/backstopTools.js');
const engineTools = require('./engineTools');

const BackstopException = require('../util/BackstopException.js');

const MIN_CHROME_VERSION = 62;
const TEST_TIMEOUT = 60000;
const DEFAULT_FILENAME_TEMPLATE = '{configId}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}';
const DEFAULT_BITMAPS_TEST_DIR = 'bitmaps_test';
const DEFAULT_BITMAPS_REFERENCE_DIR = 'bitmaps_reference';
const SELECTOR_NOT_FOUND_PATH = '/capture/resources/notFound.png';
const HIDDEN_SELECTOR_PATH = '/capture/resources/notVisible.png';
const ERROR_SELECTOR_PATH = '/capture/resources/unexpectedError.png';
const BODY_SELECTOR = 'body';
const DOCUMENT_SELECTOR = 'document';
const NOCLIP_SELECTOR = 'body:noclip';
const VIEWPORT_SELECTOR = 'viewport';

module.exports = function (args) {
  const scenario = args.scenario;
  const viewport = args.viewport;
  const config = args.config;
  const runId = args.id;
  const assignedPort = args.assignedPort;
  const scenarioLabelSafe = engineTools.makeSafe(scenario.label);
  const variantOrScenarioLabelSafe = scenario._parent ? engineTools.makeSafe(scenario._parent.label) : scenarioLabelSafe;

  return processScenarioView(scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, runId);
};


async function processScenarioView (scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config, runId) {
  if (!config.paths) {
    config.paths = {};
  }

  if (typeof viewport.label !== 'string') {
    viewport.label = viewport.name || '';
  }

  const engineScriptsPath = config.env.engine_scripts || config.env.casper_scripts || config.env.engine_scripts_default;
  const isReference = config.isReference;

  const VP_W = viewport.width || viewport.viewport.width;
  const VP_H = viewport.height || viewport.viewport.height;

  let engineOptions = {};
  if (typeof config.engineOptions === 'object') {
    engineOptions = config.engineOptions;
  }
  const launchOptions = Object.assign({}, engineOptions, {ignoreHTTPSErrors: true, headless: !!!config.debugWindow});

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  page.setViewport({width: VP_W, height: VP_H});
  page.setDefaultNavigationTimeout(engineTools.getEngineOption(config, 'waitTimeout', TEST_TIMEOUT));

  if (isReference) {
    console.log(chalk.blue('CREATING NEW REFERENCE FILE'));
  }

  // --- set up console output ---
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`Browser Console Log ${i}: ${msg.args()[i]}`);
  });

  let chromeVersion = await page.evaluate(_ => {
    let v = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
    return v ? parseInt(v[2], 10) : 0;
  })

  if (chromeVersion < MIN_CHROME_VERSION) {
    console.warn(`***WARNING! CHROME VERSION ${MIN_CHROME_VERSION} OR GREATER IS REQUIRED. PLEASE UPDATE YOUR CHROME APP!***`);
  }

  let result;
  const puppetCommands = async () => {
    // --- BEFORE SCRIPT ---
    var onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
    if (onBeforeScript) {
      var beforeScriptPath = path.resolve(engineScriptsPath, onBeforeScript);
      if (fs.existsSync(beforeScriptPath)) {
        await require(beforeScriptPath)(page, scenario, viewport, isReference, browser);
      } else {
        console.warn('WARNING: script not found: ' + beforeScriptPath);
      }
    }

    //  --- OPEN URL ---
    var url = scenario.url;
    if (isReference && scenario.referenceUrl) {
      url = scenario.referenceUrl;
    }
    await page.goto(translateUrl(url));

    await injectBackstopTools(page);

    //  --- WAIT FOR READY EVENT ---
    var readyEvent = scenario.readyEvent || config.readyEvent;
    if (readyEvent) {
      await page.evaluate(`window._readyEvent = '${readyEvent}'`)

      await page.waitForFunction(() => {
        return window._backstopTools.hasLogged(window._readyEvent);
      });

      await page.evaluate(_ => console.info('readyEvent ok'));
    }

    // --- WAIT FOR SELECTOR ---
    if (scenario.readySelector) {
      await page.waitFor(scenario.readySelector);
    }
    //

    // --- DELAY ---
    if (scenario.delay > 0) {
      await page.waitFor(scenario.delay);
    }

    //--- REMOVE SELECTORS ---
    if (scenario.hasOwnProperty('removeSelectors')) {
      const removeSelectors = async () => {
        return Promise.all(
          scenario.removeSelectors.map(async (selector) => {
            await page
              .evaluate(`window._backstopSelector = '${selector}'`);

            await page
              .evaluate(() => {
                document.querySelectorAll(window._backstopSelector).forEach(s => {
                  s.style.display = 'none';
                  s.classList.add('__86d');
                });
              });
          })
        );
      }

      await removeSelectors();
    }

    //  --- ON READY SCRIPT ---
    var onReadyScript = scenario.onReadyScript || config.onReadyScript;
    if (onReadyScript) {
      var readyScriptPath = path.resolve(engineScriptsPath, onReadyScript);
      if (fs.existsSync(readyScriptPath)) {
        await require(readyScriptPath)(page, scenario, viewport, isReference, browser);
      } else {
        console.warn('WARNING: script not found: ' + readyScriptPath);
      }
    }

    // reinstall tools in case onReadyScript has loaded a new URL.
    await injectBackstopTools(page);

    // --- HIDE SELECTORS ---
    if (scenario.hasOwnProperty('hideSelectors')) {
      const hideSelectors = async () => {
        return Promise.all(
          scenario.hideSelectors.map(async (selector) => {
            await page
              .evaluate(`window._backstopSelector = '${selector}'`)

            await page
              .evaluate(() => {
                document.querySelectorAll(window._backstopSelector).forEach(s => {
                  s.style.visibility = 'hidden';
                });
              });
          })
        );
      }
      await hideSelectors()
    }

    // --- HANDLE NO-SELECTORS ---
    if (!scenario.hasOwnProperty('selectors') || !scenario.selectors.length) {
      scenario.selectors = [DOCUMENT_SELECTOR];
    }

    await page.evaluate(`window._selectorExpansion = '${scenario.selectorExpansion}'`)
    await page.evaluate(`window._backstopSelectors = '${scenario.selectors}'`)
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
    })
  }

  await puppetCommands().catch(e => {
    result = {
      backstopSelectorsExp: [],
      backstopSelectorsExpMap: []
    };
    console.log(chalk.red("######## Error running Puppeteer #########"), e);
  })

  let compareConfig
  let error
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
      result.backstopSelectorsExpMap
    )
  } catch (e) {
    error = e;
  }

  return new Promise((resolve, reject) => {
    if (compareConfig) {
      resolve(compareConfig);
    } else {
      resolve(new BackstopException('Puppeteer error', scenario, viewport, error));
    }
  });
}

// TODO: Should be in engineTools
async function delegateSelectors (page, browser, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, config, selectors, selectorMap) {
  const fileNameTemplate = config.fileNameTemplate || DEFAULT_FILENAME_TEMPLATE;
  const configId = config.id || engineTools.genHash(config.backstopConfigFileName);
  const bitmapsTestPath = config.paths.bitmaps_test || DEFAULT_BITMAPS_TEST_DIR;
  const bitmapsReferencePath = config.paths.bitmaps_reference || DEFAULT_BITMAPS_REFERENCE_DIR;
  const outputFileFormatSuffix = '.' + (config.outputFormat && config.outputFormat.match(/jpg|jpeg/) || 'png');

  let compareConfig = {testPairs: []};
  let captureDocument = false;
  let captureViewport = false;
  let captureList = [];
  let captureJobs = [];

  selectors.forEach(function (selector, i) {
    var cleanedSelectorName = selector.replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number
    var fileName = engineTools.getFilename(fileNameTemplate, outputFileFormatSuffix, configId, scenario.sIndex, variantOrScenarioLabelSafe, i, cleanedSelectorName, viewport.vIndex, viewport.label);
    var referenceFilePath = bitmapsReferencePath + '/' + engineTools.getFilename(fileNameTemplate, outputFileFormatSuffix, configId, scenario.sIndex, scenarioLabelSafe, i, cleanedSelectorName, viewport.vIndex, viewport.label);
    var testFilePath = bitmapsTestPath + '/' + config.screenshotDateTime + '/' + fileName;
    var filePath = config.isReference ? referenceFilePath : testFilePath;

    if (!config.isReference) {
      var requireSameDimensions;
      if (scenario.requireSameDimensions !== undefined) {
        requireSameDimensions = scenario.requireSameDimensions;
      } else if (config.requireSameDimensions !== undefined) {
        requireSameDimensions = config.requireSameDimensions;
      } else {
        requireSameDimensions = config.defaultRequireSameDimensions;
      }
      compareConfig.testPairs.push({
        reference: referenceFilePath,
        test: testFilePath,
        selector: selector,
        fileName: fileName,
        label: scenario.label,
        requireSameDimensions: requireSameDimensions,
        misMatchThreshold: engineTools.getMisMatchThreshHold(scenario, config)
      });
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
    captureJobs.push(function () { return captureScreenshot(page, browser, captureDocument, selectorMap, config, []); });
  }
  // TODO: push captureViewport into captureList (instead of calling captureScreenshot()) to improve perf.
  if (captureViewport) {
    captureJobs.push(function () { return captureScreenshot(page, browser, captureViewport, selectorMap, config, []); });
  }
  if (captureList.length) {
    captureJobs.push(function () { return captureScreenshot(page, browser, null, selectorMap, config, captureList); });
  }

  return new Promise(function (resolve, reject) {
    var job = null;
    var errors = [];
    var next = function () {
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
    await browser.close();
  }).catch(async (err) => {
    console.log(chalk.red(err));
    await browser.close();
  }).then(_ => compareConfig);
}


async function captureScreenshot (page, browser, selector, selectorMap, config, selectors) {
  let filePath
  let fullPage = (selector === NOCLIP_SELECTOR || selector === DOCUMENT_SELECTOR)
  if (selector) {
    filePath = selectorMap[selector].filePath;
    ensureDirectoryPath(filePath);
    try {
      await page
        .screenshot({
          path: filePath,
          fullPage: fullPage
        });
    } catch (e) {
      console.log(chalk.red(`Error capturing..`), e);
      return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
    }
  } else {
    // OTHER-SELECTOR screenshot
    const selectorShot = async (s, path) => {
      const el = await page.$(s)
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          await el.screenshot({
            path: path
          })
        } else {
          console.log(chalk.yellow(`Element not visible for capturing: ${s}`));
          return fs.copy(config.env.backstop + HIDDEN_SELECTOR_PATH, filePath);
        }
      } else {
        console.log(chalk.magenta(`Element not found for capturing: ${s}`));
        return fs.copy(config.env.backstop + SELECTOR_NOT_FOUND_PATH, filePath);
      }
    }

    const selectorsShot = async () => {
      return Promise.all(
        selectors.map(async s => {
          filePath = selectorMap[s].filePath;
          ensureDirectoryPath(filePath);
          try {
            await selectorShot(s, filePath);
          } catch (e) {
            console.log(chalk.red(`Error capturing Element ${s}`), e);
            return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
          }
        })
      );
    }
    await selectorsShot()
  }
}

// handle relative file name
function translateUrl (url) {
  const RE = new RegExp('^[./]');
  if (RE.test(url)) {
    const fileUrl = 'file://' + path.join(process.cwd(), url);
    console.log('Relative filename detected -- translating to ' + fileUrl);
    return fileUrl;
  } else {
    return url;
  }
}
