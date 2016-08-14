var open = require('open');
var isWin = require('../util/isWin');
var Promise = require('es6-promise').Promise;
var fs = require('../util/fs');
var logger = require('../util/logger')('openReport');

module.exports = {
  execute: function (config) {

    var referenceDir = config.backstop + '/compare/bitmaps_reference/';
    var testDir = config.backstop + '/compare/bitmaps_test/';

    console.log('\nTesting with ', config.compareConfigFileName);

    var promises = [];

    // cache bitmaps_reference files locally
    promises.push(fs.copyGlob(config.bitmaps_reference + '/**/*', referenceDir).then(function() { logger.log('Copied references'); }, function(err) { logger.error("Failed reference copy"); throw err;}));

    // cache bitmaps_test files locally
    promises.push(fs.copyGlob(config.bitmaps_test + '/**/*', testDir).then(function() { logger.log('Copied test'); }, function(err) { logger.error("Failed test copy"); throw err; }));

    promises.push(new Promise(function(resolve, reject) {
      var json = require(config.customBackstop + '/' + config.compareConfigFileName);

      //json.compareConfig.testPairs.forEach(function (item) {
      //  var rFile = referenceDir + item.reference.split('/').slice(-1)[0];
      //  var tFile = testDir + item.test.split('/').slice(-2).join('/');
      //  item.local_reference = rFile;
      //  item.local_test = tFile;
      //});

      fs.writeFile(config.backstop + '/compare/config.json', JSON.stringify(json.compareConfig, null, 2)).then(resolve, reject);
    }).then(function() { logger.log('Copied configuration'); }, function(err) { logger.error("Failed configuration copy"); throw err; }));

    return Promise.all(promises).then(function() {
      console.log('Opening report -> ', config.compareReportURL + '\n');
      open(config.compareReportURL, isWin ? 'chrome' : 'Google Chrome');
    });
  }
};
