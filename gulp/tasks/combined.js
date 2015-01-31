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



//MANAGE DEPENDENCIES
gulp.task('init',function(cb){

	//load missing bower components
	if(!fs.existsSync(comparePath+'/bower_components')){
		console.log('\nBackstopJS needs to update bower_components, please hang on...\n');
		var bowerProcess = (process.platform === "win32" ? "bower.cmd" : "bower");
		spawn(bowerProcess,['install'],{cwd:comparePath}).on('error', function(){console.log('\nBower process fail. :(  Please report this bug on github.\n');});
	}
	cb();

});



//GENERATE CAPTURE CONFIG
gulp.task('genConfig',function(){
	return gulp.src(captureConfigFileNameDefault)
		.pipe(rename(backstopConfigFileName))
		.pipe(gulp.dest('/'));
});



//FIRST CLEAN REFERENCE DIR.  THEN TEST
gulp.task('reference', ['clean','bless'], function() {
		gulp.run('test');
		console.log('reference has run.')
});


//CLEAN THE bitmaps_reference DIRECTORY
gulp.task('clean', function (cb) {
	del([
		bitmaps_reference + '/**'
	], cb);
	genDefaultCompareConfig();
	console.log('bitmaps_reference was cleaned.');
});




//BLESS THE CURRENT CAPTURE CONFIG
gulp.task('bless',function(){
	return gulp.src(activeCaptureConfigPath)
		.pipe(rename(captureConfigFileNameCache))
		.pipe(gulp.dest('/'));
});


gulp.task('echo',function(){
	var genReferenceMode = false;

	var tests = ['capture/echoFiles.js'];

	// var args = ['test'].concat(tests); //this is required if using casperjs test option

	var casperProcess = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
	var casperChild = spawn(casperProcess, tests); //use args here to add test option to casperjs execute stmt

	casperChild.stdout.on('data', function (data) {
		console.log('CasperJS:', data.toString().slice(0, -1)); // Remove \n
	});


	casperChild.on('close', function (code) {
		var success = code === 0; // Will be 1 in the event of failure
		var result = (success)?'Echo files completed.':'Echo files failed with code: '+code;

		console.log('\n'+result);

		//exit if there was some kind of failure in the casperChild process
		if(code!=0)return false;

	});


})
