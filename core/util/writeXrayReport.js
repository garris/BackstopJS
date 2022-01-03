const fs = require('../util/fs');
const path = require('path');
const logger = require('../util/logger')('Xray report');
const _ = require('lodash');
const cloneDeep = require('lodash/cloneDeep');
const { stat } = require('fs');

module.exports = function (config, reporter) {
  const jsonReporter = cloneDeep(reporter);

  function toAbsolute (p) {
    return path.isAbsolute(p) ? p : path.join(config.projectPath, p);
  }

  function transformTestCases (testCases) {
    const transformedTestCases = [];
    let testStatus = 'PASSED';

    for (const testName in testCases) {
      const testCase = testCases[testName];
      const xrayTestResult = {
        'iterations': [],
        'testInfo': {}
      };

      testCase.forEach((testedViewport) => {
        let { pair: { viewportLabel: name }, status } = testedViewport;

        status = `${status}ed`.toUpperCase();
        if (status === 'FAILED') {
          testStatus = status;
        }
        xrayTestResult.iterations.push({ name, status });
      });

      xrayTestResult.status = testStatus;
      xrayTestResult.testInfo.requirementKeys = testCase[0].pair.metadata;
      xrayTestResult.testInfo.summary = testCase[0].pair.label;
      xrayTestResult.testInfo.type = "Generic";
      transformedTestCases.push(
        xrayTestResult
      );
    }

    return transformedTestCases;
  }

  function transformToXrayJson (json) {
    const results = {}
    const namedTestCases = _.groupBy(json, 'pair.label');
    return results.tests = transformTestCases(namedTestCases);
  }

  logger.log('Writing  Xray json report');

  return fs.ensureDir(toAbsolute(config.json_report)).then(function () {
    const res = transformToXrayJson(jsonReporter.tests);

    return fs.writeFile(toAbsolute(config.compareJsonFileName), JSON.stringify(res, null, 2)).then(
      function () {
        logger.log('Wrote Xray Json report to: ' + toAbsolute(config.compareJsonFileName));
      },
      function (err) {
        logger.error('Failed writing Xray Json report to: ' + toAbsolute(config.compareJsonFileName));
        throw err;
      }
    );
  });
};
