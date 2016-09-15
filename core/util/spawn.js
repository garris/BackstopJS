'use strict';

var child = require('child_process');
var isWin = require('./isWin');

module.exports = {

  spawn: function (command, args, options) {
    try {
      if (isWin) {
        command += '.cmd'
      }

      var spawn = child.spawn(command, args, options);

      spawn.stdout.on('data', function (data) {
        console.log('Server: ', data.toString().slice(0, -1).split('\n').join('\n' + 'Server: '));
      });

      spawn.stderr.on('data', function (data) {
        console.log('Server: ', data.toString().slice(0, -1).split('\n').join('\n' + 'Server: '));
      });

      spawn.on('exit', function () {
        console.log('Process closed!');
      });

    } catch (e) {
      throw e;
    }
  }
};

