var fs = require('../util/fs');
var spawn = require('child_process').spawn;
var isRunning = require('is-running');
var argv = require('yargs').argv;

// THIS WILL START THE LOCAL WEBSERVER
// IF ALREADY STARTED IT WILL NOT TRY TO START AGAIN
module.exports = {
  execute: function (config) {
    return fs.exists(config.serverPidFile)
      .then(function shouldServerStart (exists) {
        if (!exists) {
          return true;
        }

        return fs.readFile(config.serverPidFile)
          .then(function (data) {
            return !data || !isRunning(parseInt(data));
          });
      })
      .then(function startServerIfNecessary (shouldStart) {
        if (shouldStart) {
          return start(config);
        }
      });
  }
};

function start (config) {
  var time = (Number(argv.t) === argv.t && argv.t % 1 === 0) ? argv.t : 15;
  var port = config.portNumber;

  var serverHook = spawn(
    'node',
    [__dirname + '/../../server.js', '-t', time, '-p', port],
    {detached: true, stdio: 'ignore'}
  );
  serverHook.unref();

  return fs.writeFile(config.serverPidFile, serverHook.pid)
    .then(function logServerPid () {
      console.log('\nServer launched in background with PID: ' + serverHook.pid);
      console.log('Listening on port: ' + port);

      if (time > 0) {
        console.log('NOTE: Sever will auto-shutdown in ' + time + ' mins.\n');
      } else {
        console.log('NOTE: Sever will run until you stop it with \'backstop stop\'.\n');
      }
    });
}
