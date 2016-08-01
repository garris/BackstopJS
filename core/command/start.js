var fs = require('../util/fs');
var spawn = require('child_process').spawn;
var isRunning = require('is-running');
var paths = require('../util/paths');
var argv = require('yargs').argv;

var defaultPort = paths.portNumber || 3001;

// THIS WILL START THE LOCAL WEBSERVER
// IF ALREADY STARTED IT WILL NOT TRY TO START AGAIN
module.exports = {
  execute: function (done) {
    return fs.exists(paths.serverPidFile)
      .then(function shouldServerStart (exists) {
        if (!exists) {
          return true;
        }

        return fs.readFile(paths.serverPidFile)
          .then(function (data) {
            return !data || !isRunning(parseInt(data));
          });
      })
      .then(function startServerIfNecessary (shouldStart) {
        if (shouldStart) {
          return start();
        }
      });
  }
};

function start () {
  var time = (Number(argv.t) === argv.t && argv.t % 1 === 0) ? argv.t : 15;
  var port = argv.p || defaultPort;

  var serverHook = spawn(
    'node',
    ['server.js', '-t', time, '-p', port],
    {detached: true, stdio: 'ignore'}
  );
  serverHook.unref();

  return fs.writeFile(paths.serverPidFile, serverHook.pid)
    .then(function logServerPid () {
      console.log('\nServer launched in background with PID: ' + serverHook.pid);
      console.log('Listening on port: ' + port);

      if (time > 0) {
        console.log('NOTE: Sever will auto-shutdown in ' + time + ' mins.\n');
      } else {
        console.log('NOTE: Sever will run until you stop it with \'npm run stop\'.\n');
      }
    });
}
