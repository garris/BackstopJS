var path = require('path');
var temp = require('temp');

function projectPath(config) {
  // Legacy mode, if the cwd is the backstop module
  if (config.backstop === process.cwd()) {
    console.log('BackstopJS is running in legacy mode.');
    return path.join(__dirname, '../../../..');
  }
  return process.cwd();
}

function loadProjectConfig(command, options, config) {
  var configPathArg = options && (options.backstopConfigFilePath || options.configPath || options.config || null);
  if (configPathArg) {
    if (path.isAbsolute(configPathArg)) {
      config.backstopConfigFileName = configPathArg;
    } else {
      config.backstopConfigFileName = path.join(config.customBackstop, configPathArg);
    }
  } else {
    config.backstopConfigFileName = path.join(config.customBackstop, 'backstop.json');
  }

  var userConfig = {};
  var CMD_REQUIRES_CONFIG = command !== 'genConfig';
  if (CMD_REQUIRES_CONFIG && config.backstopConfigFileName) {
    try {
      console.log('BackstopJS loading config: ', config.backstopConfigFileName, '\n');
      userConfig = require(config.backstopConfigFileName);
    } catch (e) {
      console.error('Error ' + e);
      process.exit(1);
    }
  }
  return userConfig;
}

function bitmapPaths(config, userConfig) {
  config.bitmaps_reference = path.join(config.customBackstop, 'backstop_data', 'bitmaps_reference');
  config.bitmaps_test = path.join(config.customBackstop, 'backstop_data', 'bitmaps_test');
  if (userConfig.paths) {
    config.bitmaps_reference = userConfig.paths.bitmaps_reference || config.bitmaps_reference;
    config.bitmaps_test = userConfig.paths.bitmaps_test || config.bitmaps_test;
  }
}

function ci(config, userConfig) {
  config.ci_report = path.join(config.customBackstop, 'backstop_data', 'ci_report');
  if (userConfig.paths) {
    config.ci_report = userConfig.paths.ci_report || config.ci_report;
  }
  config.ci = {
    format: 'junit',
    testReportFileName: 'xunit',
    testSuiteName: 'BackstopJS'
  };

  if (userConfig.ci) {
    config.ciReport = {
      format: userConfig.ci.format || config.ci.format,
      testReportFileName: userConfig.ci.testReportFileName || config.ci.testReportFileName,
      testSuiteName: userConfig.ci.testSuiteName || config.ci.testSuiteName
    };
  } else {
    config.ciReport = config.ci;
  }
}
function htmlReport(config, userConfig) {
  config.html_report = path.join(config.customBackstop, 'backstop_data', 'html_report');
  config.openReport = true;
  if ('openReport' in userConfig) {
    config.openReport = userConfig.openReport;
  }

  if (userConfig.paths) {
    config.html_report = userConfig.paths.html_report || config.html_report;
  }

  config.compareConfigFileName = path.join(config.html_report, 'config.js');
  config.compareReportURL = path.join(config.html_report, 'index.html');
}

function comparePaths(config) {
  config.comparePath = path.join(config.backstop, 'compare');
  config.tempCompareConfigFileName = temp.path({suffix: '.json'});
}
function captureConfigPaths(config) {
  config.captureConfigFileName = path.join(config.backstop, 'capture', 'config.json');
  config.captureConfigFileNameDefault = path.join(config.backstop, 'capture', 'config.default.json');
}
function casper(config, userConfig) {
  config.casper_scripts = path.join(config.customBackstop, 'backstop_data', 'casper_scripts');
  config.casper_scripts_default = path.join(config.backstop, 'capture', 'casper_scripts');

  config.casperFlags = userConfig.casperFlags || null;

  if (userConfig.paths) {
    config.casper_scripts = userConfig.paths.casper_scripts || config.casper_scripts;
  }
}

function makeConfig(command, options) {
  var config = {};

  config.args = options || {};

  config.backstop = path.join(__dirname, '../..'); // backstop module
  config.customBackstop = projectPath(config);

  var userConfig = loadProjectConfig(command, options, config);

  bitmapPaths(config, userConfig);
  ci(config, userConfig);
  htmlReport(config, userConfig);
  comparePaths(config);
  captureConfigPaths(config);
  casper(config, userConfig);


  config.engine = userConfig.engine || null;
  config.report = userConfig.report || ['browser'];
  config.defaultMisMatchThreshold = 0.1;
  config.debug = userConfig.debug || false;

  return config;
}

module.exports = makeConfig;
