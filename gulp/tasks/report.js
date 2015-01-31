var gulp = require('gulp');


gulp.task('report',['start'],function(){
  setTimeout(function(){gulp.run('openReport')},100);
});
