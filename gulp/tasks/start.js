var gulp  = require('gulp');
var fs    = require('fs');
var exec  = require('child_process').exec;
var spawn = require('child_process').spawn;
var paths = require('../util/paths');



//THIS WILL START THE LOCAL WEBSERVER
//IF ALREADY STARTED IT WILL NOT TRY TO START AGAIN
gulp.task("start",function(){

  fs.readFile(paths.serverPidFile, function(err,data){

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
    fs.writeFileSync(paths.serverPidFile,serverHook.pid);
    console.log('\nServer launched in background with PID: '+serverHook.pid)
    console.log('NOTE: Sever will auto-shutdown (default time 15 mins). See documentation for more info.\n')
  }


});
