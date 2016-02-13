var gulp = require('gulp');
var paths = require('../util/paths');

gulp.task('report', function(){

  if (!paths.report || paths.report.indexOf( 'browser' ) > -1 ){
    setTimeout(function(){gulp.run('openReport')},100);
  }

  if (!paths.report || paths.report.indexOf( 'prepare' ) > -1 ){
    setTimeout(function(){gulp.run('createReport')},100);
  }

  if (!paths.report || paths.report.indexOf( 'CLI' ) > -1 ){
    setTimeout(function(){gulp.run('compare')},1000);
  }
});
