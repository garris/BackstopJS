var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;

var paths = {};

// BACKSTOP MODULE PATH
paths.backstop                      = path.join(__dirname, '../..');

function getBackstopConfigFileName() {
	if(argv.backstopConfigFilePath) {
		if(argv.backstopConfigFilePath.substr(-5) !== '.json') {
			throw new Error('Backstop config file has to be a .json file');
		}
		var isAbsolutePath = argv.backstopConfigFilePath.charAt(0) === '/';
		var configPath = isAbsolutePath ? argv.backstopConfigFilePath : path.join(paths.backstop, argv.backstopConfigFilePath);
		if(!fs.existsSync(configPath)) {
			throw new Error('Couldn\'t resolve backstop config file');
		}
		return configPath;
	}
	return path.join(paths.backstop, '../../backstop.json');
}
// BACKSTOP CONFIG PATH
paths.backstopConfigFileName = getBackstopConfigFileName();

// BITMAPS PATHS -- note: this path is overwritten if config files exist.  see below.
paths.bitmaps_reference             = paths.backstop + '/bitmaps_reference';
paths.bitmaps_test                  = paths.backstop + '/bitmaps_test';

// COMPARE PATHS -- note: compareConfigFileName is overwritten if config files exist.  see below.
paths.comparePath                   = paths.backstop + '/compare';
paths.compareConfigFileName         = paths.comparePath+'/config.json';
paths.compareReportURL              = 'http://localhost:3001/compare/';

// CAPTURE CONFIG PATHS
paths.captureConfigFileName         = paths.backstop + '/capture/config.json';
paths.captureConfigFileNameCache    = paths.backstop + '/capture/.config.json.cache';
paths.captureConfigFileNameDefault  = paths.backstop + '/capture/config.default.json';

// SCRIPTS PATHS -- note: scripts is overwritten if config file exists.
paths.casper_scripts                = null;
paths.casper_scripts_default        = paths.backstop + '/capture/casper_scripts';

// SERVER PID PATH
paths.serverPidFile                 = paths.backstop + '/server.pid';

// Get different backstop.json if it is passed in as an option
function getBackstopConfig() {
	console.log("in backstop config");
	if(argv.backstopConfig) {
		console.log(argv.backstopConfig);
		if(argv.backstopConfig.substr(-5) !== '.json') {
			throw new Error('Backstop config file has to be a .json file');
		}
		var isAbsolutePath = argv.backstopConfig.charAt(0) === '/';
		var configPath = isAbsolutePath ? argv.backstopConfig : path.join(paths.backstop, argv.backstopConfig);
		if(!fs.existsSync(configPath)) {
			throw new Error('Couldn\'t resolve backstop config file');
		}
		// Passed in different config, use passed in file
		console.log('\nBackstopJS Config loaded at location', paths.backstopConfig);
		return configPath;
	}
	// Did not pass in a different config, use default
	console.log('\nCurrent config file location...\n ==> '+paths.backstopConfigFileName);
	console.log('\n`$ gulp genConfig` generates a configuration boilerplate file in `' + paths.backstopConfigFileName + '`. (Will overwrite existing files.)\n')
	return paths.captureConfigFileNameDefault;
}
// ACTIVE CAPTURE CONFIG PATH
paths.activeCaptureConfigPath       = getBackstopConfig();

// overwrite default filepaths if config files exist
if(fs.existsSync(paths.activeCaptureConfigPath)){
  var configJSON = fs.readFileSync(paths.activeCaptureConfigPath, "utf8");
  var config = JSON.parse(configJSON);
  if (config.paths) {
    paths.bitmaps_reference = config.paths.bitmaps_reference || paths.bitmaps_reference;
    paths.bitmaps_test = config.paths.bitmaps_test || paths.bitmaps_test;
    paths.compareConfigFileName = config.paths.compare_data || paths.compareConfigFileName;
    paths.casper_scripts = config.paths.casper_scripts || null;
  }

  paths.cliExitOnFail = config.cliExitOnFail || false;
  paths.casperFlags = config.casperFlags || null;
  paths.engine = config.engine || null;
  paths.report = config.report || null;

}

module.exports = paths;
