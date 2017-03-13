var path = require('path');

module.exports = function (module, bin) {
  try {
    if (module === 'phantomjs-prebuilt') {
      return require('phantomjs-prebuilt').path;
    }

    var pathToExecutableModulePackageJson = require.resolve(path.join(module, 'package.json'));
    var executableModulePackageJson = require(pathToExecutableModulePackageJson);
    var relativePathToExecutableBinary = executableModulePackageJson.bin[bin] || executableModulePackageJson.bin;
    var pathToExecutableModule = pathToExecutableModulePackageJson.replace('package.json', '');
    return path.join(pathToExecutableModule, relativePathToExecutableBinary);
  } catch (e) {
    throw new Error('Couldn\'t find executable for module "' + module + '" and bin "' + bin + '"\n' + e.message);
  }
};
