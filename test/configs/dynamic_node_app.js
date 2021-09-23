#!/usr/bin/env node

// EXAMPLE COMMAND
// ~/Development/BackstopJS/test/configs
// $ node dynamic_node_app --dynamicTestId=6 --testLabel="dynamic test" --scenarioLabel="one" --url=https://garris.github.io/BackstopJS?cookie --command=test

//  THIS IS A DEMO OF DYNAMIC SCENARIO MODE
//
// - Each time the above command is run with a unique scenarioLabel and URL a new scenario is created and added to a test identified by dynamicTestId.
//
// - In this way you can create an arbitrary test creating new scenarios on-the-fly.
//
// - Once you have created initial test data, commands like `--command=approve` will operate as expected using scenario labels defined on the most recent run.
//
// - Subsequent `test` runs using a unique dynamicTestId value will create new dynamic scenarios where scenarioLabel and URL values that were approved
//   on previous runs will compared against the current unique test run.
//
// - This mode is intended for integrating with external test runners such as qunit -- like in the https://github.com/garris/ember-backstop project.
//

const assert = require('assert').strict;
const parseArgs = require('minimist');
const backstop = require('../../core/runner');
const URL = 'https://garris.github.io/BackstopJS';

const argsOptions = parseArgs(process.argv.slice(2), {
  string: ['dynamicTestId', 'testLabel', 'scenarioLabel', 'url', 'command'],
  default: {
    url: URL
  }
});

console.log('Dynamic test example.');
console.log(`config: ${JSON.stringify(argsOptions, null, 2)}`);

assert.ok(argsOptions.dynamicTestId, 'Hold on there: dynamicTestId must represent a unique identifyer (string or int) for each test run.');

/**
 * A config used to test explicity setting a config.
 * @type {Object}
 */
const exampleConfig = {
  i: true, // incremental flag -- surpresses cleaning reference directory durning reference command
  config: {
    dynamicTestId: argsOptions.dynamicTestId, // when truthy backstop will assume one dynamic scenario which is appended to test report belonging to dynamicTestId
    id: argsOptions.testLabel,
    viewports: [
      {
        label: 'phone',
        width: 320,
        height: 480
      }
    ],
    scenarios: [
      {
        label: argsOptions.scenarioLabel,
        url: argsOptions.url
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

function approve () {
  backstop('approve', exampleConfig);
}

function open () {
  backstop('openReport', exampleConfig);
}

function main () {
  backstop('test', exampleConfig).then(
    () => {
      console.log('No changes found.');
    },
    () => {
      console.log('Changes found.');
    }
  );
}

switch (argsOptions.command) {
  case 'approve':
    approve();
    break;
  case 'open':
  case 'openReport':
    open();
    break;
  default:
    main();
}
