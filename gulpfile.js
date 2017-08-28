/**
 * This is a crude gulp script for use when
 * bug fixing or developing new fixtures.
 *
 * Copies local contents of /core/ into the
 * default system global /node_modules/backstopjs
 * directory.
 *
 * To use, make sure you have gulp-cli installed globally,
 * then run `gulp` inside directory which contains this file.
 */

var gulp = require('gulp');
var src = './core';
var dest = '/usr/local/lib/node_modules/backstopjs/';

gulp.task('default', function () {
  gulp.src(src + '/**/*', { base: '.' }).pipe(gulp.dest(dest));
});

var watcher = gulp.watch(src + '/**/*', ['default']);
watcher.on('change', function (event) {
  console.log(`${new Date().getTime()}: File ${event.path} was ${event.type}.`);
});
