const assert = require('assert');
const path = require('path');

process.chdir(__dirname);

const makeConfig = require('../../../core/util/makeConfig');
const { version } = require('../../../package');
const configFile = require('./backstop');

// root of backstop dir, not related to cwd
const backstopDir = path.resolve(__dirname, '../../..');

const expectedConfig = {
  args: {},
  asyncCompareLimit: undefined,
  backstop: backstopDir,
  backstopVersion: version,
  bitmaps_reference: path.resolve('backstop_data/bitmaps_reference'),
  bitmaps_test: path.resolve('backstop_data/bitmaps_test'),
  ci_report: path.resolve('backstop_data/ci_report'),
  html_report: path.resolve('backstop_data/html_report'),
  openReport: true,
  comparePath: path.resolve(backstopDir, 'compare/output'),
  captureConfigFileNameDefault: path.resolve(backstopDir, 'capture/config.default.json'),
  engine: null,
  engine_scripts: path.resolve('backstop_data/engine_scripts'),
  engine_scripts_default: path.resolve(backstopDir, 'capture/engine_scripts'),
  perf: {},
  id: configFile.id,
  report: ['browser'],
  ciReport: {
    format: 'junit',
    testReportFileName: 'xunit',
    testSuiteName: 'BackstopJS'
  },
  compareConfigFileName: path.resolve('backstop_data/html_report/config.js'),
  compareReportURL: path.resolve('backstop_data/html_report/index.html'),
  defaultMisMatchThreshold: 0.1,
  debug: false,
  resembleOutputOptions: undefined,
  dockerCommandTemplate: undefined,
  archivePath: path.resolve('backstop_data/reports'),
  archiveReport: false
};

describe('make config it', function () {
  it('should return the default config correctly', function () {
    const actualConfig = makeConfig('test');

    assert(actualConfig.tempCompareConfigFileName);
    delete actualConfig.tempCompareConfigFileName;

    assert(actualConfig.backstopConfigFileName);
    delete actualConfig.backstopConfigFileName;

    assert(actualConfig.projectPath);
    delete actualConfig.projectPath;

    assert(actualConfig.captureConfigFileName);
    delete actualConfig.captureConfigFileName;

    assert(actualConfig.json_report);
    delete actualConfig.json_report;

    assert(actualConfig.compareJsonFileName);
    delete actualConfig.compareJsonFileName;

    assert.deepStrictEqual(actualConfig, expectedConfig);
  });
});
