var gulp  = require('gulp');
var fs    = require('fs');
var spawn = require('child_process').spawn;
var isRunning = require('is-running');
var paths = require('../util/paths');
var argv  = require('yargs').argv;

var defaultPort = paths.portNumber || 3001;


//THIS WILL START THE LOCAL WEBSERVER
//IF ALREADY STARTED IT WILL NOT TRY TO START AGAIN
gulp.task("start",function(done){

  fs.readFile(paths.serverPidFile, function(err,data){

    if(data){
      var pid = parseInt(data);

      if(!isRunning(pid)) {
        start();
      }
    }else{
      start();
    }
    setTimeout(done, 1000);
  });


  function start() {
    var time = (Number(argv.t) === argv.t && argv.t % 1 === 0) ? argv.t : 15;
    var port = argv.p || defaultPort;
    var serverHook = spawn('node', ['server.js', '-t', time, '-p', port],  {detached: true, stdio:'ignore'});
    serverHook.unref();
    fs.writeFileSync(paths.serverPidFile, serverHook.pid);
    console.log('\nServer launched in background with PID: ' + serverHook.pid);
    console.log('Listening on port: ' + port);

    if (time > 0) {
      console.log('NOTE: Sever will auto-shutdown in ' + time + ' mins.\n');
    } else {
      console.log('NOTE: Sever will run until you stop it with \'npm run stop\'.\n')
    }

  }


});
