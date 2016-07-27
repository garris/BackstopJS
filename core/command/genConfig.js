var vfs = require('vinyl-fs');
var rename = require('gulp-rename');
var paths = require('../util/paths');

/**
 * Copies a boilerplate config file to the current config file location.
 */
module.exports = {
  before: ['genScripts'],
  execute: function genConfig () {
    return vfs.src(paths.captureConfigFileNameDefault)
      .pipe(rename(paths.backstopConfigFileName))
      .pipe(vfs.dest('/'));
  }
};
