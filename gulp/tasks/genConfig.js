var gulp   = require('gulp');
var rename = require('gulp-rename');
var paths  = require('../util/paths');


//GENERATE CAPTURE CONFIG
gulp.task('genConfig',function(){
  return gulp.src(paths.captureConfigFileNameDefault)
    .pipe(rename(paths.backstopConfigFileName))
    .pipe(gulp.dest('/'));
});
