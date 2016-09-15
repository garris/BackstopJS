var gulp  = require('gulp');
var open  = require("gulp-open");
var isWin = require('../util/isWin');
var paths = require('../util/paths');

var referenceDir = './bitmaps_reference/';
var testDir = './bitmaps_test/';

gulp.task("openReport", ['start', 'createReport'], function(){

  console.log('\nTesting with ',paths.compareConfigFileName);
  console.log('Opening report -> ',paths.compareReportURL + '\n');

  var options = {
    url: paths.compareReportURL
    ,app: isWin ? "chrome" : "Google Chrome"
  };

  gulp.src(paths.compareConfigFileName).pipe(open("",options));

});
