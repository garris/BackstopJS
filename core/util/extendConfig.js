var path = require('path');
var temp = require('temp');
var fs = require('fs');
var hash = require('object-hash');
const tmpdir = require('os').tmpdir();
const version = require('../../package.json').version;

function extendConfig (config, userConfig) {
  bitmapPaths(config, userConfig);
  ci(config, userConfig);
  htmlReport(config, userConfig);
  comparePaths(config);
  captureConfigPaths(config);
  casper(config, userConfig);
  engine(config, userConfig);

  config.engine = userConfig.engine || null;
  config.report = userConfig.report || ['browser'];
  config.defaultMisMatchThreshold = 0.1;
  config.debug = userConfig.debug || false;
  config.resembleOutputOptions = userConfig.resembleOutputOptions;
  config.asyncCompareLimit = userConfig.asyncCompareLimit;
  config.backstopVersion = version;
  return config;
}

function bitmapPaths (config, userConfig) {
  config.bitmaps_reference = path.join(config.projectPath, 'backstop_data', 'bitmaps_reference');
  config.bitmaps_test = path.join(config.projectPath, 'backstop_data', 'bitmaps_test');
  if (userConfig.paths) {
    config.bitmaps_reference = userConfig.paths.bitmaps_reference || config.bitmaps_reference;
    config.bitmaps_test = userConfig.paths.bitmaps_test || config.bitmaps_test;
  }
}

function ci (config, userConfig) {
  config.ci_report = path.join(config.projectPath, 'backstop_data', 'ci_report');
  if (userConfig.paths) {
    config.ci_report = userConfig.paths.ci_report || config.ci_report;
  }
  config.ciReport = {
    format: 'junit',
    testReportFileName: 'xunit',
    testSuiteName: 'BackstopJS'
  };

  if (userConfig.ci) {
    config.ciReport = {
      format: userConfig.ci.format || config.ciReport.format,
      testReportFileName: userConfig.ci.testReportFileName || config.ciReport.testReportFileName,
      testSuiteName: userConfig.ci.testSuiteName || config.ciReport.testSuiteName
    };
  }
}

function htmlReport (config, userConfig) {
  config.html_report = path.join(config.projectPath, 'backstop_data', 'html_report');
  config.openReport = userConfig.openReport === undefined ? true : userConfig.openReport;

  if (userConfig.paths) {
    config.html_report = userConfig.paths.html_report || config.html_report;
  }

  config.compareConfigFileName = path.join(config.html_report, 'config.js');
  config.compareReportURL = path.join(config.html_report, 'index.html');
}

function comparePaths (config) {
  config.comparePath = path.join(config.backstop, 'compare');
  config.tempCompareConfigFileName = temp.path({suffix: '.json'});
}

function captureConfigPaths (config) {
  var captureDir = path.join(tmpdir, 'capture');
  if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir);
  }
  var configHash = hash(config);
  config.captureConfigFileName = path.join(tmpdir, 'capture', configHash + '.json');
  config.captureConfigFileNameDefault = path.join(config.backstop, 'capture', 'config.default.json');
}

function casper (config, userConfig) {
  config.casper_scripts = path.join(config.projectPath, 'backstop_data', 'casper_scripts');
  config.casper_scripts_default = path.join(config.backstop, 'capture', 'casper_scripts');

  config.casperFlags = userConfig.casperFlags || null;

  if (userConfig.paths) {
    config.casper_scripts = userConfig.paths.casper_scripts || config.casper_scripts;
  }
}

function engine (config, userConfig) {
  config.engine_scripts = path.join(config.projectPath, 'backstop_data', 'engine_scripts');
  config.engine_scripts_default = path.join(config.backstop, 'capture', 'engine_scripts');

  config.casperFlags = userConfig.casperFlags || null;

  if (userConfig.paths) {
    config.engine_scripts = userConfig.paths.engine_scripts || config.engine_scripts;
  }
}

module.exports = extendConfig;
