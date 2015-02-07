var gulp   = require('gulp');
var paths  = require('../util/paths');
var rename = require("gulp-rename");



//BLESS THE CURRENT CAPTURE CONFIG
gulp.task('bless',function(){
  return gulp.src(paths.activeCaptureConfigPath)
    .pipe(rename(paths.captureConfigFileNameCache))
    .pipe(gulp.dest('/'));
});
