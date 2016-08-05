var vfs = require('vinyl-fs');
var rename = require('gulp-rename');
var streamToPromise = require('../util/streamToPromise');

/**
 * Copies a boilerplate config file to the current config file location.
 */
module.exports = {
  before: ['genScripts'],
  execute: function genConfig (config) {
    var stream = vfs.src(config.captureConfigFileNameDefault)
      .pipe(rename(config.backstopConfigFileName))
      .pipe(vfs.dest('/'));

    return streamToPromise(stream);
  }
};
