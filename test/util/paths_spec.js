var mockery = require('mockery');
var assert = require('assert');
var path = require('path');

describe("setting the backstop.json location", function () {
	beforeEach(function () {
		mockery.enable({ useCleanCache: true });
	});
	afterEach(function () {
		mockery.disable();
	});

	it("should use the default settings if no path is specified ", function () {
		mockery.registerMock('fs', {
			existsSync: function () {
				return false;
			}
		});
		var paths = require('../../gulp/util/paths.js');
		assert.equal(paths.activeCaptureConfigPath, paths.captureConfigFileNameDefault);
	});

	it("should use a backstop.json file in the project root if it exists and no custom backstopConfigLocation is specified", function () {
		var expectedBackstopPath = path.join(__dirname, '../../../..', 'backstop.json');
		mockery.registerMock('fs', {
			existsSync: function (pathToCheck) {
                return pathToCheck === expectedBackstopPath;
			},
			readFileSync: function () {
				return "{}";
			}
		});
		var paths = require('../../gulp/util/paths.js');
		assert.equal(paths.activeCaptureConfigPath, expectedBackstopPath);
	});

	it('should use a relative custom backstop.json location is specified as an argument', function () {
		var customBackstopConfigPath = 'backstop/config.json';
		var expectedBackstopPath = path.join(__dirname, '../../', customBackstopConfigPath);
		mockery.registerMock('yargs', {
			argv: {backstopConfigFilePath: customBackstopConfigPath}
		});
		mockery.registerMock('fs', {
			existsSync: function (pathToCheck) {
				return pathToCheck === expectedBackstopPath;
			},
			readFileSync: function () {
				return "{}";
			}
		});
		var paths = require('../../gulp/util/paths.js');
		assert.equal(paths.activeCaptureConfigPath, expectedBackstopPath);
	});

	it('should use an absolute custom backstop.json location is specified as an argument', function () {
		var customBackstopConfigPath = '/backstop/config.json';

		mockery.registerMock('yargs', {
			argv: {backstopConfigFilePath: customBackstopConfigPath}
		});
		mockery.registerMock('fs', {
			existsSync: function (pathToCheck) {
				return pathToCheck === customBackstopConfigPath;
			},
			readFileSync: function () {
				return "{}";
			}
		});
		var paths = require('../../gulp/util/paths.js');
		assert.equal(paths.activeCaptureConfigPath, customBackstopConfigPath);
	});

	it('should throw an exception if the custom backstop location is not pointing to a valid file', function () {
		var customBackstopConfigPath = '/backstop/config.json';

		mockery.registerMock('yargs', {
			argv: {backstopConfigFilePath: customBackstopConfigPath}
		});
		mockery.registerMock('fs', {
			existsSync: function (pathToCheck) {
				return false;
			}
		});
		try {
			require('../../gulp/util/paths.js');
			assert.fail();
		} catch(err) {
			assert.equal(err.message, 'Couldn\'t resolve backstop config file');
		}
	});

	it('should throw an exception if the custom backstop location is not pointing to a .json file', function () {
		var customBackstopConfigPath = '/backstop/config.txt';

		mockery.registerMock('yargs', {
			argv: {backstopConfigFilePath: customBackstopConfigPath}
		});
		try {
			require('../../gulp/util/paths.js');
			assert.fail();
		} catch(err) {
			assert.equal(err.message, 'Backstop config file has to be a .json file');
		}
	});
});
