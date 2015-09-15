var gulp = require('gulp');
var resemble = require('node-resemble-js');
var paths = require('../util/paths');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');


gulp.task('compare', function () {
	var compareConfig = JSON.parse(fs.readFileSync(paths.compareConfigFileName, 'utf8'));
	_.each(compareConfig.testPairs, function (pair) {
		console.log('testing', pair.fileName);

		var referencePath = path.join(paths.backstop, pair.reference);
		var testPath = path.join(paths.backstop, pair.test);

		resemble(referencePath).compareTo(testPath).onComplete(function(data) {
			var imageComparisonFailed = !data.isSameDimensions || data.misMatchPercentage > pair.misMatchThreshold;
			if (imageComparisonFailed) {
				console.log('Mismatch exceeded threshold for image', pair.fileName);
				console.log(data);
				process.exit(1);
			}
		});
	});
});
