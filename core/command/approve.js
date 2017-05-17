var fs = require('../util/fs');
var path = require('path');
var map = require('p-map');

var FAILED_DIFF_RE = /^failed_diff_/;

// This task will copy ALL test bitmap files (from the most recent test directory) to the reference directory overwritting any exisiting files.
module.exports = {
  execute: function (config) {
    // TODO:  IF Exists config.bitmaps_test  &&  list.length > 0n  (otherwise throw)
    console.log('Copying from ' + config.bitmaps_test + ' to ' + config.bitmaps_reference + '.');
    return fs.readdir(config.bitmaps_test, (err, list) => {
      if (err) {
        console.log(err.stack);
      }
      var src = path.join(config.bitmaps_test, list[list.length - 1]);
      return fs.readdir(src, (err, files) => {
        if (err) {
          console.log(err.stack);
        }
        console.log('The following files will be promoted to reference...');
        return map(files, (file) => {
          if (FAILED_DIFF_RE.test(file)) {
            file = file.replace(FAILED_DIFF_RE, "");
            console.log('> ', file);
            return fs.copy(path.join(src, file), path.join(config.bitmaps_reference, file));
          }
          return true;
        });
      });
    });
  }
};
