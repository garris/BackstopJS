/**
 * PUT ALL 'FAILING' TESTS IN HERE
 */

const ENGINE = 'puppet';
const SCRIPT_PATH = 'puppet';

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
      url: '../../index.html',
      selectors: ['.doesNotExist']
    },
    {
      label: 'click',
      url: '../../index.html?click',
      clickSelector: '#alsoDoesNotExist',
      selectors: ['.moneyshot']
    },
    {
      label: 'expect',
      url: '../../index.html',
      selectors: ['p'],
      selectorExpansion: true,
      expect: 8
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
  engineOptions: {},
  asyncCaptureLimit: 10,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
};
