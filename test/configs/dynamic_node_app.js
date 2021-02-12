#!/usr/bin/env node


// EXAMPLE COMMAND
// ~/Development/BackstopJS/test/configs
// $ node dynamic_node_app --dynamicTestId=6 --testLabel="dynamic test" --scenarioLabel="one" --url=https://garris.github.io/BackstopJS?cookie --command=test




const assert = require('assert').strict;
const parseArgs = require('minimist');
const backstop = require('../../core/runner');
const URL = 'https://garris.github.io/BackstopJS';

var argsOptions = parseArgs(process.argv.slice(2), {
  string: ['dynamicTestId', 'testLabel', 'scenarioLabel', 'url', 'command'],
  default: {
    url: URL
  }
});

console.log('Dynamic test example.');
console.log(`config: ${JSON.stringify(argsOptions,null,2)}`);

assert.ok(argsOptions.dynamicTestId, `Hold on there: testId must represent a unique identifyer (string or int) for each test run.`);



/**
 * A config used to test explicity setting a config.
 * @type {Object}
 */
const exampleConfig = {
  i: true, //incremental flag -- surpresses cleaning reference directory durning reference command
  config: {
    dynamicTestId: argsOptions.dynamicTestId, //when truthy backstop will assume one dynamic scenario which is appended to test report belonging to dynamicTestId
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
      console.log(`No changes found.`);
    },
    () => {
      console.log(`Changes found.`);
    }
  );
}

if (argsOptions.command === 'approve'){
  approve();
} else {
  main();
}






