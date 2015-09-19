var gulp = require('gulp');
var paths = require('../util/paths');


gulp.task('report',['start'],function(){

  //If not server-only test then run browser report
  if (paths.report && paths.report.indexOf( 'SSR' ) > -1 ){
    setTimeout(function(){gulp.run('openReport')},100);
  }

  //If not browser-only test then run server side report
  if (paths.report && paths.report.indexOf( 'browser' ) > -1 ){
    setTimeout(function(){gulp.run('compare')},300);
  }
});
