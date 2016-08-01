var del = require('del');
var paths = require('../util/paths');
var genDefaultCompareConfig = require('../util/genDefaultCompareConfig');

module.exports = {
  execute: function () {
    genDefaultCompareConfig();

    var promise = del(
      [ paths.bitmaps_reference + '/**' ],
      { force: true }
    );

    console.log('bitmaps_reference was cleaned.');

    return promise;
  }
};
