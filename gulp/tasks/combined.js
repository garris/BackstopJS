var gulp 			= require('gulp');
var del 			= require('del');
var open 			= require("gulp-open");
var rename 		= require("gulp-rename");
var spawn 		= require('child_process').spawn;
var exec 			= require('child_process').exec;
var fs 				= require('fs');
var fse 			= require('fs-extra')
var path 			= require("path");

var backstopPath = __dirname + '/../..';

var serverPidFile 								= backstopPath + '/server.pid';

var bitmaps_reference 						= backstopPath + '/bitmaps_reference';
var bitmaps_test 									= backstopPath + '/bitmaps_test';

var backstopConfigFileName 				= path.join(backstopPath, '../..', 'backstop.json')

var captureConfigFileName 				= backstopPath + '/capture/config.json';
var captureConfigFileNameCache 		= backstopPath + '/capture/.config.json.cache';
var captureConfigFileNameDefault 	= backstopPath + '/capture/config.default.json';

var comparePath										= backstopPath + '/compare';
var compareConfigFileName 				= comparePath+'/config.json';
var compareReportURL 							= 'http://localhost:3001/compare/';

var activeCaptureConfigPath = '';

var isWin = /^win/.test(process.platform);



if(!fs.existsSync(backstopConfigFileName)){
	// console.log('\nCould not find a valid config file.');
	// console.log('\nUsing demo configuration.');
	console.log('\nTo run your own tests create a config here...\n ==> '+backstopConfigFileName);
	console.log('\nRun `$ gulp genConfig` to generate a config template file in this location.\n')
	activeCaptureConfigPath = captureConfigFileNameDefault;
}else{
	// console.log('\nBackstopJS Config loaded.\n')
	activeCaptureConfigPath = backstopConfigFileName;
}


//this is for compare/genBitmaps.js until we can pass the active location via env
fse.copySync(activeCaptureConfigPath,captureConfigFileName);


//Default config for report (compare) app
var configDefault = {
	"testPairs": []
};

var genDefaultCompareConfig = function genDefaultCompareConfig(){
	fs.writeFileSync(compareConfigFileName, JSON.stringify(configDefault,null,2));
}


if(!fs.existsSync(compareConfigFileName)){
	console.log('No compare/config.json file exists. Creating default file.')
	genDefaultCompareConfig();
}

var config = JSON.parse(fs.readFileSync(compareConfigFileName, 'utf8'));

if(!config.testPairs||config.testPairs.length==0){
	//console.log('No config data found.');
	config=configDefault;
}

var watcher = null;
