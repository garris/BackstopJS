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

    for (const testName in testCases) {
      let testStatus = 'PASSED';
      const testCase = testCases[testName];
      const xrayTestResult = {
        'iterations': [],
        'testInfo': {}
      };
      const metadata = testCase[0].pair.metadata;
      const projectKey = metadata ? metadata[0].split('-')[0] : '';

      testCase.forEach((testedViewport) => {
        let { pair: { viewportLabel: name }, status } = testedViewport;

        status = `${status}ed`.toUpperCase();
        if (status === 'FAILED') {
          testStatus = status;
        }
        xrayTestResult.iterations.push({ name, status });
      });
      xrayTestResult.status = testStatus;
      xrayTestResult.testInfo.requirementKeys = metadata;
      xrayTestResult.testInfo.projectKey = projectKey;
      xrayTestResult.testInfo.summary = testCase[0].pair.label;
      xrayTestResult.testInfo.type = "Generic";
      transformedTestCases.push(
        xrayTestResult
      );
    }

    debugger;
    return transformedTestCases;
  }

  function transformToXrayJson (json) {
    const results = {}
    const namedTestCases = _.groupBy(json, 'pair.label');

    results.tests = transformTestCases(namedTestCases);
    return results;
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
