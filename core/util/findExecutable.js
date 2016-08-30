var path = require('path');

module.exports = function(module, bin) {
  var packageJSON = require.resolve(path.join(module, 'package.json'));

  var relativeBinary = require(packageJSON).bin[bin];

  return path.join(packageJSON.replace('package.json', ''), relativeBinary);
};
