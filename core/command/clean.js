var del = require('del');
var genDefaultCompareConfig = require('../util/genDefaultCompareConfig');

module.exports = {
  execute: function (config) {
    genDefaultCompareConfig(config);

    var promise = del(
      [ config.bitmaps_reference + '/**' ],
      { force: true }
    );

    console.log('bitmaps_reference was cleaned.');

    return promise;
  }
};
