/**
 * Run test:
 * $ npm run ua-test -- --engine="puppeteer|playwright" --browser="chromium|firefox|webkit"
 */
const argv = require('minimist')(process.argv.slice(2));

const ENGINE = argv.engine || 'puppeteer';
const BROWSER = argv.browser || 'chromium';

const URL = 'https://www.whatsmyua.info/';

module.exports = {
  id: 'userAgent',
  viewports: [
    {
      label: 'default',
      width: 800,
      height: 600
    }
  ],
  onBeforeScript: 'puppet/onBefore.js',
  onReadyScript: 'puppet/onReady.js',
  scenarios: [
    {
      label: 'default',
      url: URL
    },
    {
      label: 'custom',
      url: URL,
      userAgent: 'custom_ua_backstopjs_vrt'
    }
  ],
  paths: {
    bitmaps_reference: `backstop_data/bitmaps_reference/${ENGINE}`,
    bitmaps_test: `backstop_data/bitmaps_test/${ENGINE}`,
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: `backstop_data/html_report/${ENGINE}`,
    ci_report: 'backstop_data/ci_report'
  },
  fileNameTemplate: `${ENGINE}_${BROWSER}_{scenarioLabel}`,
  report: ['browser'],
  engine: ENGINE,
  engineOptions: {
    browser: BROWSER,
    ...((BROWSER === 'webkit') && {
      args: [
        '--no-sandbox'
      ]
    })
  },
  asyncCaptureLimit: 5,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false,
  archiveReport: false,
  scenarioLogsInReports: false
};
