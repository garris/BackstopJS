var gulp = require('gulp');
var paths = require('../util/paths');

gulp.task('report',['start'],function(){

  if (!paths.report || paths.report.indexOf( 'browser' ) > -1 ){
    setTimeout(function(){gulp.run('openReport')},1000);
  }

  if (!paths.report || paths.report.indexOf( 'CLI' ) > -1 ){
    setTimeout(function(){gulp.run('compare')},500);
  }
});
