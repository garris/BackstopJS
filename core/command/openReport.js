var vfs = require('vinyl-fs');
var open = require('gulp-open');
var isWin = require('../util/isWin');
var paths = require('../util/paths');
var rename = require('gulp-rename');
var jeditor = require('gulp-json-editor');
var streamToPromise = require('../util/streamToPromise');
var Promise = require('es6-promise').Promise;

var referenceDir = './bitmaps_reference/';
var testDir = './bitmaps_test/';

module.exports = {
  execute: function () {
    console.log('\nTesting with ', paths.compareConfigFileName);
    console.log('Opening report -> ', paths.compareReportURL + '\n');

    var options = {
      url: paths.compareReportURL,
      app: isWin ? 'chrome' : 'Google Chrome'
    };

    var promises = [];

    // cache bitmaps_reference files locally
    promises.push(streamToPromise(
      vfs.src(paths.bitmaps_reference + '/**/*')
        .pipe(vfs.dest(referenceDir))
    ));

    // cache bitmaps_test files locally
    promises.push(streamToPromise(
      vfs.src(paths.bitmaps_test + '/**/*')
        .pipe(vfs.dest(testDir))
    ));

    promises.push(streamToPromise(
      vfs.src(paths.compareConfigFileName)
        .pipe(jeditor(function (config) {
          config.compareConfig.testPairs.forEach(function (item) {
            var rFile = referenceDir + item.reference.split('/').slice(-1)[0];
            var tFile = testDir + item.test.split('/').slice(-2).join('/');
            item.local_reference = rFile;
            item.local_test = tFile;
          });
          return config.compareConfig;
        }))
      .pipe(rename('compare/config.json'))
      .pipe(vfs.dest('.'))
      .pipe(open('', options))
    ));

    return Promise.all(promises);
  }
};
