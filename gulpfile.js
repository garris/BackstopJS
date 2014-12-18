var gulp 			= require('gulp');
var del 			= require('del');
var open 			= require("gulp-open");
var rename 		= require("gulp-rename");
var spawn 		= require('child_process').spawn;
var exec 			= require('child_process').exec;
var fs 				= require('fs');
var fse 			= require('fs-extra')
var path 			= require("path");

var serverPidFile 								= __dirname+'/server.pid';

var bitmaps_reference 						= __dirname+'/bitmaps_reference';
var bitmaps_test 									= 'bitmaps_test';

var backstopConfigFileName 				= path.join(__dirname, '../..', 'backstop.json')

var captureConfigFileName 				= __dirname+'/capture/config.json';
var captureConfigFileNameCache 		= __dirname+'/capture/.config.json.cache';
var captureConfigFileNameDefault 	= __dirname+'/capture/config.default.json';

var comparePath										= __dirname+'/compare';
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


//This task will generate a date-named directory with DOM screenshot files as specified in `./capture/config.json` followed by running a report.
//NOTE: If there is no bitmaps_reference directory or if the bitmaps_reference directory is empty then a new batch of reference files will be generated in the bitmaps_reference directory.  Reporting will be skipped in this case.
gulp.task('test',['init'], function () {


	// genReferenceMode contains the state which switches test or reference file generation modes
	var genReferenceMode = false;

	// THIS IS THE BLOCK WHICH SWITCHES US INTO "GENERATE REFERENCE" MODE.  I'D RATHER SOMETHING MORE EXPLICIT THO. LIKE AN ENV PARAMETER...  
	if(!fs.existsSync(bitmaps_reference)){
		console.log('\nGenerating reference files.\n');
		genReferenceMode = true;
	}

	//IF WE ARE IN TEST GENERATION MODE -- LOOK FOR CHANGES IN THE 'CAPTURE CONFIG'.
	if(!genReferenceMode){	
	
		// TEST FOR CAPTURE CONFIG CACHE -- CREATE IF ONE DOESN'T EXIST (If a .cache file does not exist it is likely a scenario where the user is testing shared reference files in a new context. e.g different dev env.).
		if(fs.existsSync(captureConfigFileNameCache)){

			//COMPARE CAPTURE CONFIG AGAINST THE CACHED VERSION. PROMPT IF DIFFERENT. 
			var config = fs.readFileSync(activeCaptureConfigPath, 'utf8');
			var cache = fs.readFileSync(captureConfigFileNameCache, 'utf8');
			if(config !== cache){
				console.log('\nIt looks like the reference configuration has been changed since last reference batch.');
				console.log('Please run `$ gulp reference` to generate a fresh set of reference files')
				console.log('or run `$ gulp bless` then `$ gulp test` to enable testing with this configuration.\n\n')
				return;
			}

		}else{
			gulp.run('bless');
		}
	}


	// AT THIS POINT WE ARE EITHER RUNNING IN "TEST" OR "REFERENCE" MODE 

	var tests = ['capture/genBitmaps.js'];
	
	// var args = ['test'].concat(tests); //this is required if using casperjs test option
	
	// var casperChild = spawn('casperjs', tests);//use args here to add test option to casperjs execute stmt
	var casperProcess = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
	var casperChild = spawn(casperProcess, tests);


	casperChild.stdout.on('data', function (data) {
		console.log('CasperJS:', data.toString().slice(0, -1)); // Remove \n
	});


	casperChild.on('close', function (code) {
		var success = code === 0; // Will be 1 in the event of failure
		var result = (success)?'Bitmap file generation completed.':'Testing script failed with code: '+code;
	
		console.log('\n'+result);

		//exit if there was some kind of failure in the casperChild process
		if(code!=0){
			console.log('\nLooks like an error occured. You may want to try running `$ gulp echo`. This will echo the requested test URL output to the console. You can check this output to verify that the file requested is indeed being received in the expected format.');
			return false;
		};
		

		var resultConfig = JSON.parse(fs.readFileSync(compareConfigFileName, 'utf8'));
		if(genReferenceMode || !resultConfig.testPairs||resultConfig.testPairs.length==0){
			console.log('\nRun `$ gulp test` to generate diff report.\n')
		}else{
			gulp.run('report');
		}
	
	});


});



gulp.task('report',['start'],function(){
	setTimeout(function(){gulp.run('openReport')},100);
})



gulp.task("openReport", function(){
	
	console.log('\nOpening report -> ',compareReportURL);

	var options = {
		url: compareReportURL
		,app: isWin ? "chrome" : "Google Chrome"
	};

	gulp.src(compareConfigFileName)
		.pipe(open("",options)); 

});




//THIS WILL START THE LOCAL WEBSERVER
//IF ALREADY STARTED IT WILL NOT TRY TO START AGAIN
gulp.task("start",function(){

	fs.readFile(serverPidFile, function(err,data){

		if(data){
			exec('kill -0 '+data,function(error, stdout, stderr){
				if(/no such process/i.test(stderr))
					start();
			});

		}else{
			start();
		}
		
	});


	function start(){
		var serverHook = spawn('node', ['server.js'],  {detached: true, stdio:'ignore'});
		serverHook.unref();
		fs.writeFileSync(serverPidFile,serverHook.pid);
		console.log('\nServer launched in background with PID: '+serverHook.pid)
		console.log('NOTE: Sever will auto-shutdown (default time 15 mins). See documentation for more info.\n')
	}

	
});



gulp.task("stop",function(){

	fs.readFile(serverPidFile, function(err,pid){
		if(pid){
			exec('kill '+pid,function(error, stdout, stderr){
				console.log('Stopped PID:'+pid)
				fs.unlinkSync(serverPidFile);
			});
		}
	});

});


gulp.task('default',function(){});





