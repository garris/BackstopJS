const { writeFile } = require('fs');
const { ensureDir } = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const cloneDeep = require('lodash/cloneDeep');
const util = require('util');

module.exports = function (config, reporter, resultName) {

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

    return transformedTestCases;
  }

  function transformToXrayJson (json) {
    const results = {}
    const namedTestCases = _.groupBy(json, 'pair.label');

    results.tests = transformTestCases(namedTestCases);
    return results;
  }

  const jsonReporter = cloneDeep(reporter);
  const ensureDirPromise = util.promisify(ensureDir);
  const writeFilePromise = util.promisify(writeFile);

  return ensureDirPromise(toAbsolute(config.customReports.reportLocation)).then(function () {
    const res = transformToXrayJson(jsonReporter.tests);
    const reportPath = toAbsolute(path.join(config.customReports.reportLocation, resultName));

    return writeFilePromise(reportPath, JSON.stringify(res, null, 2)).then(
      function () {
        console.log('Wrote Xray report to: ' + reportPath);
      },
      function (err) {
        console.error('Failed writing Xray report to: ' + reportPath);
        throw err;
      }
    );
  });
};