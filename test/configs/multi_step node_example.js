const backstop = require('../../core/runner');

console.log('Running a multi-step Backstop test. vvv');

// this will run `backstop test` with default config file (./backstop.json in current directory)
backstop('test')
  .catch(approveChanges)
  .then(() => {
    // this invocation is equivalent to running `backstop test --config=backstop_features --filter=click`
    return backstop('test', {
      filter: 'click',
      config: 'backstop_features'
    });
  })
  .catch(approveChanges)
  .then(() => {
    // this invocation is equivalent to running `backstop test --filter=Delayed` on exampleConfig.
    return backstop('test', exampleConfig);
  })
  .catch(approveChanges);

/**
 * run this to approve changes from the previous run.
 */
function approveChanges () {
  console.log('Looks like there were some changes detected since last run.');
  backstop('approve', {
    config: {
      id: 'explicity_defined',
      paths: {
        bitmaps_reference: 'backstop_data/bitmaps_reference',
        bitmaps_test: 'backstop_data/bitmaps_test'
      }
    }
  });
}

/**
 * A config used to test explicity setting a config.
 * @type {Object}
 */
const exampleConfig = {
  filter: 'Delayed',
  config: {
    id: 'explicity_defined',
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
    onBeforeScript: 'puppeteer/onBefore.js',
    onReadyScript: 'puppeteer/onReady.js',
    scenarios: [
      {
        label: 'Homepage',
        cookiePath: 'backstop_data/engine_scripts/cookies.json',
        url: 'https://garris.github.io/BackstopJS/?delay'
      },
      {
        label: 'Homepage Delayed',
        cookiePath: 'backstop_data/engine_scripts/cookies.json',
        url: 'https://garris.github.io/BackstopJS/?delay'
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
    engine: 'puppeteer',
    asyncCaptureLimit: 5,
    asyncCompareLimit: 50,
    debug: false,
    debugWindow: false
  }
};
