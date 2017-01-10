var assert = require('assert');
var makeConfig = require('../../../core/util/makeConfig');

const expectedConfig = {
  args: {},
  backstop: process.cwd() + '',
  bitmaps_reference: 'backstop_data/bitmaps_reference',
  bitmaps_test: 'backstop_data/bitmaps_test',
  ci_report: 'backstop_data/ci_report',
  html_report: 'backstop_data/html_report',
  openReport: true,
  comparePath: process.cwd() + '/compare',
  captureConfigFileName: process.cwd() + '/capture/config.json',
  captureConfigFileNameDefault: process.cwd() + '/capture/config.default.json',
  casper_scripts: 'backstop_data/casper_scripts',
  casper_scripts_default: process.cwd() + '/capture/casper_scripts',
  casperFlags: [],
  engine: 'phantomjs',
  report: ['browser'],
  ciReport: {
    format: 'junit',
    testReportFileName: 'xunit',
    testSuiteName: 'BackstopJS'
  },
  compareConfigFileName: 'backstop_data/html_report/config.js',
  compareReportURL: 'backstop_data/html_report/index.html',
  defaultMisMatchThreshold: 0.1,
  debug: false,
  resembleOutputOptions: undefined
};

describe('make config', function () {
  it('should return the default config correctly', function () {
    var actualConfig = makeConfig('test');
    delete actualConfig.tempCompareConfigFileName;
    delete actualConfig.backstopConfigFileName;
    delete actualConfig.projectPath;
    assert.deepEqual(actualConfig, expectedConfig);
  });
});
