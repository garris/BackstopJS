const executeCommand = require('./command/');
const makeConfig = require('./util/makeConfig');

module.exports = function (command, options) {
  const config = makeConfig(command, options);
  return executeCommand(command, config);
};

/* ***
// Sample of the config object that is created on `backstop init` by makeConfig()

{ args:
    { _: [ 'init' ],
        h: false,
        help: false,
        v: false,
        version: false,
        i: false,
        config: 'backstop.json'
    },
    backstop: '/Users/gshipon/Development/BackstopJS',
    projectPath: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD',
    perf: { init: { started: 2018-09-23T04:01:09.673Z } },
    backstopConfigFileName: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop.json',
    bitmaps_reference: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop_data/bitmaps_reference',
    bitmaps_test: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop_data/bitmaps_test',
    ci_report: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop_data/ci_report',
    ciReport:
    {
        format: 'junit',
        testReportFileName: 'xunit',
        testSuiteName: 'BackstopJS'
    },
    html_report: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop_data/html_report',
    openReport: true,
    compareConfigFileName: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop_data/html_report/config.js',
    compareReportURL: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop_data/html_report/index.html',
    comparePath: '/Users/gshipon/Development/BackstopJS/compare/output',
    tempCompareConfigFileName: '/var/folders/9h/wrnjdvhj2qj48yj73d9sblsw000gs9/T/118822-2689-1h46kp1.3jzk.json',
    captureConfigFileName: '/var/folders/9h/wrnjdvhj2qj48yj73d9sblsw000gs9/T/capture/33365765a815d9578b5cde5a8358b4ef3cfe2e90.json',
    captureConfigFileNameDefault: '/Users/gshipon/Development/BackstopJS/capture/config.default.json',
    casper_scripts: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop_data/casper_scripts',
    casper_scripts_default: '/Users/gshipon/Development/BackstopJS/capture/casper_scripts',
    casperFlags: null,
    engine_scripts: '/Users/gshipon/Development/BackstopJS/test/configs/test_TBD/backstop_data/engine_scripts',
    engine_scripts_default: '/Users/gshipon/Development/BackstopJS/capture/engine_scripts',
    id: undefined,
    engine: null,
    report: [ 'browser' ],
    defaultMisMatchThreshold: 0.1,
    debug: false,
    resembleOutputOptions: undefined,
    asyncCompareLimit: undefined,
    backstopVersion: '3.5.14'
}
*** */
