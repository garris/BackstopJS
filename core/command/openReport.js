var vfs = require('vinyl-fs');
var open = require('gulp-open');
var isWin = require('../util/isWin');
var rename = require('gulp-rename');
var jeditor = require('gulp-json-editor');
var streamToPromise = require('../util/streamToPromise');
var Promise = require('es6-promise').Promise;

var referenceDir = './bitmaps_reference/';
var testDir = './bitmaps_test/';

module.exports = {
  execute: function (config) {
    console.log('\nTesting with ', config.compareConfigFileName);
    console.log('Opening report -> ', config.compareReportURL + '\n');

    var options = {
      url: config.compareReportURL,
      app: isWin ? 'chrome' : 'Google Chrome'
    };

    var promises = [];

    // cache bitmaps_reference files locally
    promises.push(streamToPromise(
      vfs.src(config.bitmaps_reference + '/**/*')
        .pipe(vfs.dest(referenceDir))
    ));

    // cache bitmaps_test files locally
    promises.push(streamToPromise(
      vfs.src(config.bitmaps_test + '/**/*')
        .pipe(vfs.dest(testDir))
    ));

    promises.push(streamToPromise(
      vfs.src(config.compareConfigFileName)
        .pipe(jeditor(function (config) {
          config.compareConfig.testPairs.forEach(function (item) {
            var rFile = referenceDir + item.reference.split('/').slice(-1)[0];
            var tFile = testDir + item.test.split('/').slice(-2).join('/');
            item.local_reference = rFile;
            item.local_test = tFile;
          });
          return JSON.stringify(config.compareConfig);
        }))
      .pipe(rename('compare/config.json'))
      .pipe(vfs.dest('.'))
      .pipe(open('', options))
    ));

    return Promise.all(promises);
  }
};
