var gulp   = require('gulp');
var rename = require('gulp-rename');
var paths  = require('../util/paths');

/**
 * Copies a boilerplate config file to the current config file location.
 */
gulp.task('genConfig', ['genScripts'], function(){
  return gulp.src(paths.captureConfigFileNameDefault)
    .pipe(rename(paths.backstopConfigFileName))
    .pipe(gulp.dest('/'));
});
