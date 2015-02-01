var gulp  = require('gulp');
var open  = require("gulp-open");
var isWin = require('../util/isWin');
var paths = require('../util/paths');



gulp.task("openReport", function(){

  console.log('\nOpening report -> ',paths.compareReportURL);

  var options = {
    url: paths.compareReportURL
    ,app: isWin ? "chrome" : "Google Chrome"
  };

  gulp.src(paths.compareConfigFileName)
    .pipe(open("",options));

});
