var gulp   = require('gulp');
var paths  = require('../util/paths');
var checksum = require('checksum');
var fsx = require('fs-extra');
var updateCompareConfigs = require('../util/updateCompareConfig');

//BLESS THE CURRENT CAPTURE CONFIG
gulp.task('bless',function() {
  var config = fsx.readFileSync(paths.activeCaptureConfigPath, 'utf8');
  updateCompareConfigs(function(compareConfig) {
      compareConfig.lastConfigHash = checksum(config);
  });
});
