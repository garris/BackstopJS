const path = require('path');
const _ = require('lodash');
const fs = require('./fs');
const injectBackstopTools = require('../../capture/backstopTools.js');
const logger = require('./logger')('preparePage');

const DOCUMENT_SELECTOR = 'document';

function translateUrl (url) {
  const RE = /^[./]/;
  if (RE.test(url)) {
    return 'file://' + path.join(process.cwd(), url);
  }
  return url;
}

/**
 * Prepare a page: navigate to url, inject tools, wait for ready, handle selectors.
 * Returns the expanded selectors and selectorMap.
 *
 * Shared by runCompareScenario (liveCompare), runPlaywright, and runPuppet engines.
 */
async function preparePage (page, url, scenario, viewport, config, isReference, browserOrContext, engineScriptsPath) {
  const gotoParameters = scenario?.engineOptions?.gotoParameters || config?.engineOptions?.gotoParameters || {};

  // --- BEFORE SCRIPT ---
  const onBeforeScript = scenario.onBeforeScript || config.onBeforeScript;
  if (onBeforeScript) {
    const beforeScriptPath = path.resolve(engineScriptsPath, onBeforeScript);
    if (fs.existsSync(beforeScriptPath)) {
      await require(beforeScriptPath)(page, scenario, viewport, isReference, browserOrContext, config);
    } else {
      logger.warn('WARNING: script not found: ' + beforeScriptPath);
    }
  }

  // --- READY EVENT SETUP (before navigation to avoid missing early events) ---
  const readyEvent = scenario.readyEvent || config.readyEvent;
  const readyTimeout = scenario.readyTimeout || config.readyTimeout || 30000;
  let readyPromise;
  if (readyEvent) {
    let readyResolve;
    let readyTimeoutTimer;
    readyPromise = new Promise(function (resolve) {
      readyResolve = resolve;
      readyTimeoutTimer = setTimeout(function () {
        logger.error('ReadyEvent not detected within readyTimeout limit. (' + readyTimeout + ' ms) ' + url);
        page.removeListener('console', onConsole);
        resolve();
      }, readyTimeout);
    });

    var onConsole = function (msg) {
      for (let i = 0; i < msg.args().length; ++i) {
        const line = msg.args()[i];
        if (new RegExp(readyEvent).test(line)) {
          clearTimeout(readyTimeoutTimer);
          page.removeListener('console', onConsole);
          readyResolve();
          break;
        }
      }
    };
    page.on('console', onConsole);
  }

  // --- OPEN URL ---
  await page.goto(translateUrl(url), gotoParameters);
  await injectBackstopTools(page);

  // --- WAIT FOR READY EVENT ---
  if (readyPromise) {
    await page.evaluate('window._readyEvent = \'' + readyEvent + '\'');
    await readyPromise;
  }

  // --- WAIT FOR SELECTOR ---
  if (scenario.readySelector) {
    await page.waitForSelector(scenario.readySelector, { timeout: readyTimeout });
  }

  // --- DELAY ---
  if (scenario.delay > 0) {
    await new Promise(function (resolve) { setTimeout(resolve, scenario.delay); });
  }

  // --- REMOVE SELECTORS ---
  if (_.has(scenario, 'removeSelectors')) {
    await Promise.all(
      scenario.removeSelectors.map(function (sel) {
        return page.evaluate(function (s) {
          document.querySelectorAll(s).forEach(function (el) {
            el.style.cssText = 'display: none !important;';
            el.classList.add('__86d');
          });
        }, sel);
      })
    );
  }

  // --- ON READY SCRIPT ---
  const onReadyScript = scenario.onReadyScript || config.onReadyScript;
  if (onReadyScript) {
    const readyScriptPath = path.resolve(engineScriptsPath, onReadyScript);
    if (fs.existsSync(readyScriptPath)) {
      await require(readyScriptPath)(page, scenario, viewport, isReference, browserOrContext, config);
    } else {
      logger.warn('WARNING: script not found: ' + readyScriptPath);
    }
  }

  // reinstall tools in case onReadyScript has loaded a new URL.
  await injectBackstopTools(page);

  // --- HIDE SELECTORS ---
  if (_.has(scenario, 'hideSelectors')) {
    await Promise.all(
      scenario.hideSelectors.map(function (sel) {
        return page.evaluate(function (s) {
          document.querySelectorAll(s).forEach(function (el) {
            el.style.visibility = 'hidden';
          });
        }, sel);
      })
    );
  }

  // --- HANDLE NO-SELECTORS ---
  if (!_.has(scenario, 'selectors') || !scenario.selectors.length) {
    scenario.selectors = [DOCUMENT_SELECTOR];
  }

  // --- EXPAND SELECTORS ---
  await page.evaluate('window._selectorExpansion = \'' + scenario.selectorExpansion + '\'');
  await page.evaluate('window._backstopSelectors = \'' + scenario.selectors + '\'');
  const result = await page.evaluate(function () {
    if (window._selectorExpansion.toString() === 'true') {
      window._backstopSelectorsExp = window._backstopTools.expandSelectors(window._backstopSelectors);
    } else {
      window._backstopSelectorsExp = window._backstopSelectors;
    }
    if (!Array.isArray(window._backstopSelectorsExp)) {
      window._backstopSelectorsExp = window._backstopSelectorsExp.split(',');
    }
    window._backstopSelectorsExpMap = window._backstopSelectorsExp.reduce(function (acc, selector) {
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

  return result;
}

module.exports = preparePage;
module.exports.translateUrl = translateUrl;
