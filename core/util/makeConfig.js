var path = require('path');
var temp = require('temp');

function makeConfig (argv) {

  var config = {};

  config.args = argv;

  // BACKSTOP MODULE PATH
  config.backstop = path.join(__dirname, '../..'); // backstop module
  config.customBackstop = process.cwd(); // running instance

  // Legacy mode, if the cwd is the backstop module
  if (config.backstop == config.customBackstop) {
    config.customBackstop = path.join(__dirname, '../../../..');
  }

  // BACKSTOP CONFIG PATH
  var configPathArg = argv.backstopConfigFilePath || argv.configPath || argv.config || null;
  if (configPathArg) {
    if (configPathArg.charAt(0) === '/') {
      config.backstopConfigFileName = configPathArg;
    } else {
      config.backstopConfigFileName = path.join(config.customBackstop, configPathArg);
    }
  } else {
    config.backstopConfigFileName = path.join(config.customBackstop, 'backstop.json');
  }

  console.log('\nBackstopJS CWD: ', config.customBackstop);
  console.log('BackstopJS loading config: ', config.backstopConfigFileName, "\n");

  // LOAD CONFIG
  var userConfig = {};
  if (config.backstopConfigFileName) {
    try {
      userConfig = require(config.backstopConfigFileName);
    } catch (e) {
      console.error("Error " + e);
      process.exit(1);
    }
  }

  // BITMAPS PATHS -- note: this path is overwritten if config files exist.  see below.
  config.bitmaps_reference = config.customBackstop + '/backstop_data/bitmaps_reference';
  config.bitmaps_test = config.customBackstop + '/backstop_data/bitmaps_test';

  // Continuous Integration (CI) report
  config.ci_report = config.customBackstop + '/backstop_data/ci_report';
  config.ci = {
    format: 'junit',
    testReportFileName: 'xunit',
    testSuiteName: 'BackstopJS'
  };

  // HTML Report
  config.html_report = config.customBackstop + '/backstop_data/html_report';
  config.openReport = true;
  if ("openReport" in userConfig) {
    config.openReport = userConfig.openReport;
  }

  // COMPARE PATHS -- note: compareConfigFileName is overwritten if config files exist.  see below.
  config.comparePath = config.backstop + '/compare';
  config.tempCompareConfigFileName = temp.path({suffix: '.json'});

  // CAPTURE CONFIG PATHS
  config.captureConfigFileName = config.backstop + '/capture/config.json';
  config.captureConfigFileNameDefault = config.backstop + '/capture/config.default.json';

  // SCRIPTS PATHS -- note: scripts is overwritten if config file exists.
  config.casper_scripts = config.customBackstop + '/backstop_data/casper_scripts';
  config.casper_scripts_default = config.backstop + '/capture/casper_scripts';

  config.casperFlags = userConfig.casperFlags || null;
  config.engine = userConfig.engine || null;
  config.report = userConfig.report || [ 'CI', 'browser'];
  config.ciReport = userConfig.ci ? {
    format: userConfig.ci.format || config.ci.format,
    testReportFileName: userConfig.ci.testReportFileName || config.ci.testReportFileName,
    testSuiteName: userConfig.ci.testSuiteName || config.ci.testSuiteName
  } : config.ci;

  // overwrite default filepaths if config files exist
  if (userConfig.paths) {
    config.bitmaps_reference = userConfig.paths.bitmaps_reference || config.bitmaps_reference;
    config.bitmaps_test = userConfig.paths.bitmaps_test || config.bitmaps_test;
    config.html_report = userConfig.paths.html_report || config.html_report;
    config.casper_scripts = userConfig.paths.casper_scripts || config.casper_scripts;
    config.ci_report = userConfig.paths.ci_report || config.ci_report;
  }

  config.compareConfigFileName = config.html_report + '/config.js';
  config.compareReportURL = config.html_report + '/index.html';

  return config;
}

module.exports = makeConfig;
