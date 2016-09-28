var path = require('path');

module.exports = function(module, bin) {

  if (module === 'phantomjs-prebuilt') {
    return require('phantomjs-prebuilt').path;
  }

  // get the absolute path for package.json of a node_module
  var packageJSON = require.resolve(path.join(module, 'package.json'));

  // then get the executable name
  var relativeBinary = require(packageJSON).bin[bin];

  // return a path to the executable inside the execuatable's package
  return path.join(packageJSON.replace('package.json', ''), relativeBinary);
};
