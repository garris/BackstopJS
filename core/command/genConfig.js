var vfs = require('vinyl-fs');
var rename = require('gulp-rename');
var streamToPromise = require('../util/streamToPromise');
var paths = require('../util/paths');

/**
 * Copies a boilerplate config file to the current config file location.
 */
module.exports = {
  before: ['genScripts'],
  execute: function genConfig () {
    var stream = vfs.src(paths.captureConfigFileNameDefault)
      .pipe(rename(paths.backstopConfigFileName))
      .pipe(vfs.dest('/'));

    return streamToPromise(stream);
  }
};
