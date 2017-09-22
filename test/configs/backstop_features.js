const ENGINE = 'chrome';
const SCRIPT_PATH = 'chromy';

module.exports = {
  id: `${ENGINE}_backstop_features`,
  viewports: [
    {
      label: 'phone',
      width: 320,
      height: 480
    },
    {
      label: 'tablet',
      width: 1024,
      height: 768
    }
  ],
  onBeforeScript: `${SCRIPT_PATH}/onBefore.js`,
  onReadyScript: `${SCRIPT_PATH}/onReady.js`,
  scenarios: [
    {
      label: 'Simple',
      url: '../../index.html'
    },
    {
      label: 'delay',
      url: '../../index.html?delay',
      delay: 5000,
      selectors: ['.moneyshot']
    },
    {
      label: 'readyEvent',
      url: '../../index.html?delay',
      readyEvent: '_the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'readySelector',
      url: '../../index.html?delay',
      readySelector: '._the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'noDelay',
      url: '../../index.html?delay',
      selectors: ['.moneyshot']
    },
    {
      label: 'expanded',
      url: '../../index.html',
      selectors: ['p'],
      selectorExpansion: true
    },
    {
      label: 'notExpanded',
      url: '../../index.html',
      selectors: ['p']
    },
    {
      label: 'magicSelectors',
      url: '../../index.html',
      selectors: ['document', 'viewport']
    },
    {
      label: 'hideSelectors',
      url: '../../index.html',
      hideSelectors: ['.moneyshot']
    },
    {
      label: 'removeSelectors',
      url: '../../index.html',
      removeSelectors: ['.moneyshot']
    },
    {
      label: 'notFound',
      url: '../../index.html',
      selectors: ['.monkey']
    },
    {
      label: 'notVisible',
      url: '../../index.html',
      selectors: ['#noShow']
    },
    {
      label: 'cookies',
      cookiePath: 'backstop_data/cookies.json',
      url: 'https://garris.github.io/BackstopJS/?cookie',
      selectors: ['.moneyshot']
    },
    {
      label: 'customReadyScript',
      onReadyScript: `${SCRIPT_PATH}/overrideCSS.js`,
      url: '../../index.html',
      selectors: ['.moneyshot']
    },
    {
      label: 'redirect',
      url: '../../index.html',
      onReadyScript: `${SCRIPT_PATH}/redirect.js`,
      selectors: ['.moneyshot']
    },
    {
      label: 'hover',
      url: '../../index.html?click',
      hoverSelector: '#theLemur',
      postInteractionWait: 1000,
      selectors: ['.moneyshot']
    },
    {
      label: 'click',
      url: '../../index.html?click',
      clickSelector: '#theLemur',
      postInteractionWait: '._the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'misMatchThreshold_requireSameDimensions',
      url: 'https://garris.github.io/BackstopJS/',
      referenceUrl: 'https://garris.github.io/BackstopJS/?cookie',
      selectors: ['.moneyshot'],
      misMatchThreshold: 5.0,
      requireSameDimensions: false
    }
  ],
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report'
  },
  report: ['browser'],
  engine: ENGINE,
  engineFlags: [],
  asyncCaptureLimit: 5,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
};
