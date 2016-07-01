var gulp = require('gulp');
var resemble = require('node-resemble-js');
var paths = require('../util/paths');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var junitWriter = new (require('junitwriter'))();

gulp.task('compare', function (done) {
    var compareConfig = JSON.parse(fs.readFileSync(paths.compareConfigFileName, 'utf8')).compareConfig,
    testSuite = paths.report && paths.report.indexOf( 'CI' ) > -1 && paths.ciReport.format === 'junit' && junitWriter.addTestsuite(paths.ciReport.testSuiteName),
    testPairsLength;

    function updateProgress() {
        var results = {};
        _.each(compareConfig.testPairs, function (pair) {
            if (!results[pair.testStatus]) {
                results[pair.testStatus] = 0;
            }
            !results[pair.testStatus]++;
        });
        if (!results.running) {
            console.log ('\nTest completed...');
            console.log ('\x1b[32m', (results.pass || 0) + ' Passed', '\x1b[0m');
            console.log ('\x1b[31m', (results.fail || 0) + ' Failed\n', '\x1b[0m');

            // if the test report is enabled in the config
            if (testSuite) {
                junitWriter.save(path.join(paths.ci_report, 'xunit.xml'), function() {
                    console.log('\x1b[32m', 'Regression test report file (xunit.xml) is successfully created.', '\x1b[0m');
                });
            }

            if (results.fail) {
                console.log ('\x1b[31m', '*** Mismatch errors found ***', '\x1b[0m');
                console.log ("For a detailed report run `npm run openReport`\n");
                done(new Error('Mismatch errors found.'));
            }
        }
    }


    _.each(compareConfig.testPairs, function (pair) {
        pair.testStatus = "running";

        if (!testPairsLength) {
            testPairsLength = Object.keys(compareConfig.testPairs).length;
        }


        var referencePath = path.join(paths.backstop, pair.reference);
        var testPath = path.join(paths.backstop, pair.test);

        resemble(referencePath).compareTo(testPath).onComplete(function (data) {
            var imageComparisonFailed = !data.isSameDimensions || data.misMatchPercentage > pair.misMatchThreshold,
            error,
            testCase;

            if (imageComparisonFailed) {
                pair.testStatus = "fail";
                console.log('\x1b[31m', 'ERROR:', pair.label, pair.fileName, '\x1b[0m');
                storeFailedDiffImage(testPath, data);
            } else {
                pair.testStatus = "pass";
                console.log('\x1b[32m', 'OK:', pair.label, pair.fileName, '\x1b[0m');
            }

            if (testSuite) {
                testCase = testSuite.addTestcase(' ›› ' + pair.label, pair.selector);
                if(imageComparisonFailed) {
                    error = 'Design deviation ›› ' + pair.label + ' (' + pair.selector + ') component';
                    testCase.addError(error, 'CSS component');
                    testCase.addFailure(error, 'CSS component');
                }
            }

            updateProgress();
        });
    });

    function storeFailedDiffImage(testPath, data) {
        var failedDiffFilename = getFailedDiffFilename(testPath);
        console.log('   See:', failedDiffFilename);
        var failedDiffStream = fs.createWriteStream(failedDiffFilename);
        data.getDiffImage().pack().pipe(failedDiffStream)
    }

    function getFailedDiffFilename(testPath) {
        var lastSlash = testPath.lastIndexOf(path.sep);
        return testPath.slice(0, lastSlash + 1) + 'failed_diff_' + testPath.slice(lastSlash + 1, testPath.length);
    }
});
