var path = require('path');
var argv = require('yargs').argv;

var defaultPort = 3001;

function makeConfig (customConfig) {
  var config = {};
  config.portNumber = defaultPort;
  config.ci = {
    format: 'junit',
    testReportFileName: 'xunit',
    testSuiteName: 'BackstopJS'
  };
  // BACKSTOP MODULE PATH
  config.backstop = path.join(__dirname, '../..'); // backstop module
  config.customBackstop = process.cwd(); // running instance

  // Legacy mode, if the cwd is the backstop module
  if (config.backstop == config.customBackstop) {
    config.customBackstop = path.join(__dirname, '../../../..');
  }


  // BACKSTOP CONFIG PATH
  var configPathArg = argv.backstopConfigFilePath || argv.configPath || null;
  console.log(configPathArg);
  if (configPathArg) {
    if (configPathArg.charAt(0) === '/') {
      config.backstopConfigFileName = customConfig.backstopConfigFileName;
    } else {
      config.backstopConfigFileName = path.join(config.customBackstop, configPathArg);
    }
  } else {
    config.backstopConfigFileName = path.join(config.customBackstop, 'backstop.json');
  }

  // BITMAPS PATHS -- note: this path is overwritten if config files exist.  see below.
  config.bitmaps_reference = config.customBackstop + '/backstop_data/bitmaps_reference';
  config.bitmaps_test = config.customBackstop + '/backstop_data/bitmaps_test';

  // Continuous Integration (CI) report
  config.ci_report = config.customBackstop + '/ci_report';

  // COMPARE PATHS -- note: compareConfigFileName is overwritten if config files exist.  see below.
  config.comparePath = config.backstop + '/compare';
  config.compareConfigFileName = config.comparePath + '/config.json';

  // CAPTURE CONFIG PATHS
  config.captureConfigFileName = config.backstop + '/capture/config.json';
  config.captureConfigFileNameCache = config.backstop + '/capture/.config.json.cache';
  config.captureConfigFileNameDefault = config.backstop + '/capture/config.default.json';

  // SCRIPTS PATHS -- note: scripts is overwritten if config file exists.
  config.casper_scripts = config.customBackstop + '/backstop_data/casper_scripts';
  config.casper_scripts_default = config.backstop + '/capture/casper_scripts';

  // SERVER PID PATH
  config.serverPidFile = config.backstop + '/server.pid';

  // ACTIVE CAPTURE CONFIG PATH
  config.activeCaptureConfigPath = config.backstopConfigFileName;
  console.log('\nBackstopJS Config loaded at location', config.backstopConfigFileName);

  // overwrite default filepaths if config files exist
  if (customConfig.paths) {
    config.bitmaps_reference = customConfig.paths.bitmaps_reference || config.bitmaps_reference;
    config.bitmaps_test = customConfig.paths.bitmaps_test || config.bitmaps_test;
    config.compareConfigFileName = customConfig.paths.compare_data || config.compareConfigFileName;
    config.casper_scripts = customConfig.paths.casper_scripts || null;
    config.ci_report = customConfig.paths.ci_report || config.ci_report;
  }

  config.portNumber = customConfig.port || defaultPort;
  config.casperFlags = customConfig.casperFlags || null;
  config.engine = customConfig.engine || null;
  config.report = customConfig.report || null;
  config.ciReport = customConfig.ci ? {
    format: customConfig.ci.format || config.ci.format,
    testReportFileName: customConfig.ci.testReportFileName || config.ci.testReportFileName,
    testSuiteName: customConfig.ci.testSuiteName || config.ci.testSuiteName
  } : config.ci;

  config.compareReportURL = 'http://localhost:' + config.portNumber + '/compare/';

  return config;
}

module.exports = makeConfig;
