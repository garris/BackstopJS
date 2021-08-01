const { remote } = require('webdriverio');
const { initialiseLauncherService } = require('@wdio/utils/build/initialiseServices');

const fs = require('./fs');
const path = require('path');
const chalk = require('chalk');
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

  return processScenarioView(scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config);
};
let wdioServices;
let finalConfig;
let loadedServices = [];
let instanceCounter = 0;

async function processScenarioView (scenario, variantOrScenarioLabelSafe, scenarioLabelSafe, viewport, config) {
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

  const wdioArgs = {
    logLevel: 'trace',
    hostname: 'localhost',
    port: 7777,
    path: '/wd/hub', // remove `path` if you decided using something different from driver binaries.
    capabilities: {
      browserName: 'chrome'
    }
  };

  finalConfig = { ...wdioArgs, ...config.engineOptions.wdio };
  // merge default config
  Object.freeze(finalConfig);

  wdioServices = initialiseLauncherService(finalConfig, [{ ...finalConfig.capabilities }]);
  for (let i = 0; i < wdioServices.launcherServices.length; i++) {
    if (loadedServices.indexOf(wdioServices.launcherServices[i].constructor.name) === -1 || instanceCounter === 0) {
      console.info('Run onPrepare hook for ' + wdioServices.launcherServices[i].constructor.name);
      instanceCounter++;
      await wdioServices.launcherServices[i].onPrepare({ ...finalConfig.capabilities });
      loadedServices.push(wdioServices.launcherServices[i].constructor.name);
    }
  }
  const browser = await remote(finalConfig);

  await browser.setWindowSize(VP_W, VP_H);

  await browser.setTimeout({
    'pageLoad': engineTools.getEngineOption(config, 'waitTimeout', TEST_TIMEOUT),
    'script': engineTools.getEngineOption(config, 'waitTimeout', TEST_TIMEOUT)
  });

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
    readyResolve();
  }
  // @TODO Not sure if that is possible with selenium3
  // page.on('console', msg => {
  //   for (let i = 0; i < msg.args().length; ++i) {
  //     const line = msg.args()[i];
  //     console.log(`Browser Console Log ${i}: ${line}`);
  //     if (readyEvent && new RegExp(readyEvent).test(line)) {
  //       readyResolve();
  //     }
  //   }
  // });

  console.warn(`ready event is not available`);
  let result;
  const wdioCommands = async () => {
    // --- BEFORE SCRIPT ---
    var onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
    if (onBeforeScript) {
      var beforeScriptPath = path.resolve(engineScriptsPath, onBeforeScript);
      if (fs.existsSync(beforeScriptPath)) {
        await require(beforeScriptPath)(browser, scenario, viewport, isReference, browser, config);
      } else {
        console.warn('WARNING: script not found: ' + beforeScriptPath);
      }
    }

    //  --- OPEN URL ---
    var url = scenario.url;
    if (isReference && scenario.referenceUrl) {
      url = scenario.referenceUrl;
    }
    await browser.url(translateUrl(url));

    await injectBackstopTools(browser);

    // //  --- WAIT FOR READY EVENT ---
    // if (readyEvent) {
    //   await browser.execute(`window._readyEvent = '${readyEvent}'`);
    //
    //   await readyPromise;
    //
    //   clearTimeout(readyTimeoutTimer);
    //
    //   await browser.execute(_ => console.info('readyEvent ok'));
    // }

    // --- WAIT FOR SELECTOR ---
    if (scenario.readySelector) {
      await browser.$(scenario.readySelector).waitForDisplayed({
        timeout: readyTimeout
      });
    }
    //

    // --- DELAY ---
    if (scenario.delay > 0) {
      await browser.pause(scenario.delay);
    }

    // --- REMOVE SELECTORS ---
    if (scenario.hasOwnProperty('removeSelectors')) {
      const removeSelectors = async () => {
        return Promise.all(
          scenario.removeSelectors.map(async (selector) => {
            await browser
              .execute((sel) => {
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
    var onReadyScript = scenario.onReadyScript || config.onReadyScript;
    if (onReadyScript) {
      var readyScriptPath = path.resolve(engineScriptsPath, onReadyScript);
      if (fs.existsSync(readyScriptPath)) {
        await require(readyScriptPath)(browser, scenario, viewport, isReference, browser, config);
      } else {
        console.warn('WARNING: script not found: ' + readyScriptPath);
      }
    }

    // reinstall tools in case onReadyScript has loaded a new URL.
    await injectBackstopTools(browser);

    // --- HIDE SELECTORS ---
    if (scenario.hasOwnProperty('hideSelectors')) {
      const hideSelectors = async () => {
        return Promise.all(
          scenario.hideSelectors.map(async (selector) => {
            await browser
              .execute((sel) => {
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
    if (!scenario.hasOwnProperty('selectors') || !scenario.selectors.length) {
      scenario.selectors = [DOCUMENT_SELECTOR];
    }

    await browser.execute(`window._selectorExpansion = '${scenario.selectorExpansion}'`);
    await browser.execute(`window._backstopSelectors = '${scenario.selectors}'`);
    result = await browser.execute(() => {
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
  await wdioCommands().catch(e => {
    console.log(chalk.red(`Puppeteer encountered an error while running scenario "${scenario.label}"`));
    console.log(chalk.red(e));
    error = e;
  });

  let compareConfig;
  if (!error) {
    try {
      compareConfig = await delegateSelectors(
        browser,
        browser,
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
    await browser.closeWindow();
  }

  if (error) {
    const testPair = engineTools.generateTestPair(config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, 0, `${scenario.selectors.join('__')}`);
    const filePath = config.isReference ? testPair.reference : testPair.test;
    testPair.engineErrorMsg = error.message;

    compareConfig = {
      testPairs: [ testPair ]
    };
    fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
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
  selectorMap
) {
  let compareConfig = { testPairs: [] };
  let captureDocument = false;
  let captureViewport = false;
  let captureList = [];
  let captureJobs = [];

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
    captureJobs.push(function () { return captureScreenshot(page, browser, captureDocument, selectorMap, config, [], viewport); });
  }
  // TODO: push captureViewport into captureList (instead of calling captureScreenshot()) to improve perf.
  if (captureViewport) {
    captureJobs.push(function () { return captureScreenshot(page, browser, captureViewport, selectorMap, config, [], viewport); });
  }
  if (captureList.length) {
    captureJobs.push(function () { return captureScreenshot(page, browser, null, selectorMap, config, captureList, viewport); });
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
    await browser.closeWindow();
    // tear down services
    if (instanceCounter === 1) {
      for (let i = 0; i < wdioServices.launcherServices.length; i++) {
        console.info('Run onComplete hook for ' + wdioServices.launcherServices[i].constructor.name);
        await wdioServices.launcherServices[i].onComplete(0, undefined, undefined, undefined);
        instanceCounter = instanceCounter - 1;
      }
    }
  }).catch(async (err) => {
    console.log(chalk.red(err));
    await browser.closeWindow();
  }).then(_ => compareConfig);
}

async function captureScreenshot (page, browser, selector, selectorMap, config, selectors, viewport) {
  let filePath;
  let fullPage = (selector === NOCLIP_SELECTOR || selector === DOCUMENT_SELECTOR);
  if (selector) {
    filePath = selectorMap[selector].filePath;
    ensureDirectoryPath(filePath);

    try {
      // @todo set browser height workaround try
      // @fixme still picture is same height
      await browser.execute((VP_H) => {
        document.querySelector('html').style.height = VP_H + 'px';
        document.querySelector('html').style.overflow = 'hidden';
      }, viewport.height);
      const body = await browser.$('html');
      await body.saveScreenshot(filePath);
    } catch (e) {
      console.log(chalk.red(`Error capturing..`), e);
      return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
    }
  } else {
    // OTHER-SELECTOR screenshot
    const selectorShot = async (s, path) => {
      await browser.$(selector).saveScreenshot(path);
    };

    const selectorsShot = async () => {
      return Promise.all(
        selectors.map(async selector => {
          filePath = selectorMap[selector].filePath;
          ensureDirectoryPath(filePath);
          try {
            await selectorShot(selector, filePath);
          } catch (e) {
            console.log(chalk.red(`Error capturing Element ${selector}`), e);
            return fs.copy(config.env.backstop + ERROR_SELECTOR_PATH, filePath);
          }
        })
      );
    };
    await selectorsShot();
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
