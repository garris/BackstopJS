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
});
