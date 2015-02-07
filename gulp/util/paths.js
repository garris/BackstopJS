var path = require('path');
var fs = require('fs');



var paths = {};

// BACKSTOP MODULE PATH
paths.backstop                      = __dirname + '/../..';

// SERVER PID PATH
paths.serverPidFile                 = paths.backstop + '/server.pid';

// BITMAPS PATHS
paths.bitmaps_reference             = paths.backstop + '/bitmaps_reference';
paths.bitmaps_test                  = paths.backstop + '/bitmaps_test';

// BACKSTOP CONFIG PATH
paths.backstopConfigFileName        = path.join(paths.backstop, '../..', 'backstop.json');

// COMPARE PATHS
paths.comparePath                   = paths.backstop + '/compare';
paths.compareConfigFileName         = paths.comparePath+'/config.json';
paths.compareReportURL              = 'http://localhost:3001/compare/';

// CAPTURE CONFIG PATHS
paths.captureConfigFileName         = paths.backstop + '/capture/config.json';
paths.captureConfigFileNameCache    = paths.backstop + '/capture/.config.json.cache';
paths.captureConfigFileNameDefault  = paths.backstop + '/capture/config.default.json';

// ACTIVE CAPTURE CONFIG PATH
paths.activeCaptureConfigPath       = '';

if(!fs.existsSync(paths.backstopConfigFileName)){
  // console.log('\nCould not find a valid config file.');
  // console.log('\nUsing demo configuration.');
  console.log('\nTo run your own tests create a config here...\n ==> '+paths.backstopConfigFileName);
  console.log('\nRun `$ gulp genConfig` to generate a config template file in this location.\n')
  paths.activeCaptureConfigPath = paths.captureConfigFileNameDefault;
}else{
  // console.log('\nBackstopJS Config loaded.\n')
  paths.activeCaptureConfigPath = paths.backstopConfigFileName;
}



module.exports = paths;
