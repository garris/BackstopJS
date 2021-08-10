const fs = require('../util/fs');
const path = require('path');
const map = require('p-map');

const FAILED_DIFF_RE = /^failed_diff_/;
const FILTER_DEFAULT = /\w+/;

// This task will copy ALL test bitmap files (from the most recent test directory) to the reference directory overwriting any existing files.
module.exports = {
  execute: function (config) {
    // TODO:  IF Exists config.bitmaps_test  &&  list.length > 0n  (otherwise throw)
    console.log('Copying from ' + config.bitmaps_test + ' to ' + config.bitmaps_reference + '.');
    return new Promise((resolve, reject) => {
      fs.readdir(config.bitmaps_test, (err, list) => {
        if (err) {
          console.log(err.stack);
          reject(err);
        }
        const src = path.join(config.bitmaps_test, list[list.length - 1]);
        return fs.readdir(src, (err, files) => {
          if (err) {
            console.log(err.stack);
            reject(err);
          }
          console.log('The following files will be promoted to reference...');

          return map(files, (file) => {
            if (FAILED_DIFF_RE.test(file)) {
              file = file.replace(FAILED_DIFF_RE, '');

              let imageFilter = FILTER_DEFAULT;
              if (config.args && config.args.filter) {
                imageFilter = new RegExp(config.args.filter);
              }
              if (imageFilter.test(file)) {
                console.log('> ', file);
                return fs.copy(path.join(src, file), path.join(config.bitmaps_reference, file));
              }
            }
            return true;
          }).then(resolve).catch(reject);
        });
      });
    });
  }
};
