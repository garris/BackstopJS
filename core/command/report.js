const path = require('path');
const chalk = require('chalk');
const cloneDeep = require('lodash/cloneDeep');

const allSettled = require('../util/allSettled');
const fs = require('../util/fs');
const logger = require('../util/logger')('report');
const compare = require('../util/compare/');

function writeReport (config, reporter) {
  const promises = [];

  if (config.report && config.report.indexOf('CI') > -1 && config.ciReport.format === 'junit') {
    promises.push(writeJunitReport(config, reporter));
  }

  if (config.report && config.report.indexOf('json') > -1) {
    promises.push(writeJsonReport(config, reporter));
  }

  promises.push(writeBrowserReport(config, reporter));

  return allSettled(promises);
}

function writeBrowserReport (config, reporter) {
  let testConfig;
  if (typeof config.args.config === 'object') {
    testConfig = config.args.config;
  } else {
    testConfig = Object.assign({}, require(config.backstopConfigFileName));
  }

  let browserReporter = cloneDeep(reporter);

  function toAbsolute (p) {
    return (path.isAbsolute(p)) ? p : path.join(config.projectPath, p);
  }
  logger.log('Writing browser report');

  return fs.copy(config.comparePath, toAbsolute(config.html_report)).then(function () {
    logger.log('Resources copied');

    // Fixing URLs in the configuration
    const report = toAbsolute(config.html_report);
    for (let i in browserReporter.tests) {
      if (browserReporter.tests.hasOwnProperty(i)) {
        const pair = browserReporter.tests[i].pair;
        pair.reference = path.relative(report, toAbsolute(pair.reference));
        pair.test = path.relative(report, toAbsolute(pair.test));

        if (pair.diffImage) {
          pair.diffImage = path.relative(report, toAbsolute(pair.diffImage));
        }
      }
    }

    const reportConfigFilename = toAbsolute(config.compareConfigFileName);
    const testReportJsonName = toAbsolute(config.bitmaps_test + '/' + config.screenshotDateTime + '/report.json');

    // if this is a dynamic test then we assume browserReporter has one scenario. This scenario will be appended to any existing report.
    if (testConfig.dynamicTestId) {
      try {
        console.log('Attempting to open: ', testReportJsonName);
        const testReportJson = require(testReportJsonName);
        testReportJson.tests = testReportJson.tests.filter(test => test.pair.fileName !== browserReporter.tests[0].pair.fileName);
        testReportJson.tests.push(browserReporter.tests[0]);
        browserReporter = testReportJson;
      } catch (err) {
        console.log('Creating new report.');
      }
    }

    const jsonReport = JSON.stringify(browserReporter, null, 2);
    const jsonpReport = `report(${jsonReport});`;

    const jsonConfgWrite = fs.writeFile(testReportJsonName, jsonReport).then(function () {
      logger.log('Copied json report to: ' + testReportJsonName);
    }, function (err) {
      logger.error('Failed json report copy to: ' + testReportJsonName);
      throw err;
    });

    const jsonpConfgWrite = fs.writeFile(toAbsolute(reportConfigFilename), jsonpReport).then(function () {
      logger.log('Copied jsonp report to: ' + reportConfigFilename);
    }, function (err) {
      logger.error('Failed jsonp report copy to: ' + reportConfigFilename);
      throw err;
    });

    return allSettled([jsonpConfgWrite, jsonConfgWrite]);
  }).then(function () {
    if (config.openReport && config.report && config.report.indexOf('browser') > -1) {
      const executeCommand = require('./index');
      return executeCommand('_openReport', config);
    }
  });
}

function writeJunitReport (config, reporter) {
  logger.log('Writing jUnit Report');

  const builder = require('junit-report-builder');
  const suite = builder.testSuite()
    .name(reporter.testSuite);

  for (let i in reporter.tests) {
    if (!reporter.tests.hasOwnProperty(i)) {
      continue;
    }

    const test = reporter.tests[i];
    const testCase = suite.testCase()
      .className(test.pair.selector)
      .name(' ›› ' + test.pair.label);

    if (!test.passed()) {
      const error = 'Design deviation ›› ' + test.pair.label + ' (' + test.pair.selector + ') component';
      testCase.failure(error);
      testCase.error(error);
    }
  }

  return new Promise(function (resolve, reject) {
    let testReportFilename = config.testReportFileName || config.ciReport.testReportFileName;
    testReportFilename = testReportFilename.replace(/\.xml$/, '') + '.xml';
    const destination = path.join(config.ci_report, testReportFilename);

    try {
      builder.writeTo(destination);
      logger.success('jUnit report written to: ' + destination);

      resolve();
    } catch (e) {
      return reject(e);
    }
  });
}

function writeJsonReport (config, reporter) {
  const jsonReporter = cloneDeep(reporter);

  function toAbsolute (p) {
    return (path.isAbsolute(p)) ? p : path.join(config.projectPath, p);
  }
  logger.log('Writing json report');
  return fs.ensureDir(toAbsolute(config.json_report)).then(function () {
    logger.log('Resources copied');

    // Fixing URLs in the configuration
    const report = toAbsolute(config.json_report);
    for (let i in jsonReporter.tests) {
      if (jsonReporter.tests.hasOwnProperty(i)) {
        const pair = jsonReporter.tests[i].pair;
        pair.reference = path.relative(report, toAbsolute(pair.reference));
        pair.test = path.relative(report, toAbsolute(pair.test));

        if (pair.diffImage) {
          pair.diffImage = path.relative(report, toAbsolute(pair.diffImage));
        }
      }
    }

    return fs.writeFile(toAbsolute(config.compareJsonFileName), JSON.stringify(jsonReporter.getReport(), null, 2)).then(function () {
      logger.log('Wrote Json report to: ' + toAbsolute(config.compareJsonFileName));
    }, function (err) {
      logger.error('Failed writing Json report to: ' + toAbsolute(config.compareJsonFileName));
      throw err;
    });
  });
}

module.exports = {
  execute: function (config) {
    return compare(config).then(function (report) {
      const failed = report.failed();
      logger.log('Test completed...');
      logger.log(chalk.green(report.passed() + ' Passed'));
      logger.log(chalk[(failed ? 'red' : 'green')](+failed + ' Failed'));

      return writeReport(config, report).then(function (results) {
        for (let i = 0; i < results.length; i++) {
          if (results[i].state !== 'fulfilled') {
            logger.error('Failed writing report with error: ' + results[i].value);
          }
        }

        if (failed) {
          logger.error('*** Mismatch errors found ***');
          // logger.log('For a detailed report run `backstop openReport`\n');
          throw new Error('Mismatch errors found.');
        }
      });
    }, function (e) {
      logger.error('Comparison failed with error:' + e);
    });
  }
};
