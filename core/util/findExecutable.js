const path = require('path');

module.exports = function (module, bin) {
  try {
    const pathToExecutableModulePackageJson = require.resolve(path.join(module, 'package.json'));
    const executableModulePackageJson = require(pathToExecutableModulePackageJson);
    const relativePathToExecutableBinary = executableModulePackageJson.bin[bin] || executableModulePackageJson.bin;
    const pathToExecutableModule = pathToExecutableModulePackageJson.replace('package.json', '');
    return path.join(pathToExecutableModule, relativePathToExecutableBinary);
  } catch (e) {
    throw new Error('Couldn\'t find executable for module "' + module + '" and bin "' + bin + '"\n' + e.message);
  }
};
