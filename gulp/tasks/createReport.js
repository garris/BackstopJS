var gulp  = require('gulp');
var paths = require('../util/paths');
var rename = require('gulp-rename');
var jeditor = require("gulp-json-editor");

var referenceDir = './bitmaps_reference/';
var testDir = './bitmaps_test/';

gulp.task("createReport", function(){

  console.log('\nTesting with ',paths.compareConfigFileName);
  console.log('Creating report -> ',paths.compareReportURL + '\n');

  // cache bitmaps_reference files locally
  gulp.src(paths.bitmaps_reference + '/**/*')
    .pipe(gulp.dest(referenceDir));

  // cache bitmaps_test files locally
  gulp.src(paths.bitmaps_test + '/**/*')
    .pipe(gulp.dest(testDir));


  gulp.src(paths.compareConfigFileName)
    .pipe(jeditor(function(json) {
      json.compareConfig.testPairs.forEach(function(item){
        var rFile = referenceDir + item.reference.split('/').slice(-1)[0];
        var tFile = testDir + item.test.split('/').slice(-2).join('/');
        item.local_reference = rFile;
        item.local_test = tFile;
      });
      return json.compareConfig;
    }))
    .pipe(rename('compare/config.json'))
    .pipe(gulp.dest('.'));
});
