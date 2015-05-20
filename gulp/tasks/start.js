var gulp  = require('gulp');
var fs    = require('fs');
var exec  = require('child_process').exec;
var spawn = require('child_process').spawn;
var paths = require('../util/paths');
var argv  = require('yargs').argv;



//THIS WILL START THE LOCAL WEBSERVER
//IF ALREADY STARTED IT WILL NOT TRY TO START AGAIN
gulp.task("start",function(){

  fs.readFile(paths.serverPidFile, function(err,data) {

    if (data) {
      exec('kill -0 '+data,function(error, stdout, stderr) {
        if(/no such process/i.test(stderr))
          start();
      });

    } else {
      start();
    }

  });

  function start() {
    var time = (Number(argv.t) === argv.t && argv.t % 1 === 0) ? argv.t : 15;

    var serverHook = spawn('node', ['server.js', '-t ' + time],  {detached: true, stdio:'ignore'});
    serverHook.unref();
    fs.writeFileSync(paths.serverPidFile, serverHook.pid);
    console.log('\nServer launched in background with PID: '+serverHook.pid);

    if (time > 0) {
      console.log('NOTE: Sever will auto-shutdown in ' + time + ' mins.\n');
    } else {
      console.log('NOTE: Sever will run until you stop it with \'gulp stop\'.\n')
    }

  }


});
