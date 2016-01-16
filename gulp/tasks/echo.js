var gulp  = require('gulp');
var spawn = require('child_process').spawn;
var paths = require('../util/paths');


gulp.task('echo',function(){
  var genReferenceMode = false;

  var tests = ['capture/echoFiles.js'];

  var args = [];

  if (/slimer/.test(paths.engine)) {
    args = ['--engine=slimerjs'];
  }

  if (paths.casperFlags) {
    if (/--engine=/.test(paths.casperFlags.toString())) {
      args = paths.casperFlags; // casperFlags --engine setting takes presidence -- replace if found.
    } else {
      args = args.concat(paths.casperFlags);
    }
  }

  var casperArgs = tests.concat(args);
  console.log("\nRunning CasperJS with: ", casperArgs)
  var casperProcess = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
  var casperChild = spawn(casperProcess, casperArgs);

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
