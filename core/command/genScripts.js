var paths = require('../util/paths');
var vfs = require('vinyl-fs');
var Promise = require('es6-promise').Promise;
var streamToPromise = require('../util/streamToPromise');

/**
 * Called by genConfig.
 * Copies boilerplate scripts to the current casper_scripts directory.
 */
module.exports = {
  execute: function genScripts () {
    if (paths.casper_scripts) {
      var stream = vfs.src([paths.casper_scripts_default + '/*.js'])
        .pipe(vfs.dest(paths.casper_scripts));

      return streamToPromise(stream);
    } else {
      return Promise.reject('ERROR: Can\'t generate a scripts directory. No \'casper_scripts\' path property was found in backstop.json.');
    }
  }
};
