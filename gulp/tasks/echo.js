var gulp  = require('gulp');
var spawn = require('child_process').spawn;


gulp.task('echo',function(){
  var genReferenceMode = false;

  var tests = ['capture/echoFiles.js'];

  var args = ['--ssl-protocol=any'];//added for https compatibility for older versions of phantom

  var casperArgs = tests.concat(args);

  // var args = ['test'].concat(tests); //this is required if using casperjs test option

  var casperProcess = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
  var casperChild = spawn(casperProcess, casperArgs); //use args here to add test option to casperjs execute stmt

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
