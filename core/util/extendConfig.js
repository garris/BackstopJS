const path = require('path');
const temp = require('temp');
const fs = require('fs');
const hash = require('object-hash');
const tmpdir = require('os').tmpdir();
const version = require('../../package.json').version;

function extendConfig (config, userConfig) {
  bitmapPaths(config, userConfig);
  ci(config, userConfig);
  htmlReport(config, userConfig);
  jsonReport(config, userConfig);
  comparePaths(config);
  captureConfigPaths(config);
  engine(config, userConfig);

  config.id = userConfig.id;
  config.engine = userConfig.engine || null;
  config.report = userConfig.report || ['browser'];
  config.defaultMisMatchThreshold = 0.1;
  config.debug = userConfig.debug || false;
  config.resembleOutputOptions = userConfig.resembleOutputOptions;
  config.asyncCompareLimit = userConfig.asyncCompareLimit;
  config.backstopVersion = version;
  config.dockerCommandTemplate = userConfig.dockerCommandTemplate;
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
  config.archivePath = path.join(config.projectPath, 'backstop_data', 'reports');
  config.archiveReport = userConfig.archiveReport === undefined ? false : userConfig.archiveReport;

  if (userConfig.paths) {
    config.html_report = userConfig.paths.html_report || config.html_report;
    config.archivePath = userConfig.paths.reports_archive || config.archivePath;
  }

  config.compareConfigFileName = path.join(config.html_report, 'config.js');
  config.compareReportURL = path.join(config.html_report, 'index.html');
}

function jsonReport (config, userConfig) {
  config.json_report = path.join(config.projectPath, 'backstop_data', 'json_report');
  if (userConfig.paths) {
    config.json_report = userConfig.paths.json_report || config.json_report;
  }

  config.compareJsonFileName = path.join(config.json_report, 'jsonReport.json');
}

function comparePaths (config) {
  config.comparePath = path.join(config.backstop, 'compare/output');
  config.tempCompareConfigFileName = temp.path({ suffix: '.json' });
}

function captureConfigPaths (config) {
  const captureDir = path.join(tmpdir, 'capture');
  if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir);
  }
  const configHash = hash(config);
  config.captureConfigFileName = path.join(tmpdir, 'capture', configHash + '.json');
  config.captureConfigFileNameDefault = path.join(config.backstop, 'capture', 'config.default.json');
}

function engine (config, userConfig) {
  config.engine_scripts = path.join(config.projectPath, 'backstop_data', 'engine_scripts');
  config.engine_scripts_default = path.join(config.backstop, 'capture', 'engine_scripts');

  if (userConfig.paths) {
    config.engine_scripts = userConfig.paths.engine_scripts || config.engine_scripts;
  }
}

module.exports = extendConfig;
