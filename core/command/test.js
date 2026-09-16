const cloneDeep = require('lodash/cloneDeep');
const createBitmaps = require('../util/createBitmaps');
const { shouldRunDocker, runDocker } = require('../util/runDocker');
const compare = require('../util/compare/');
const logger = require('../util/logger')('test');

function getRetryConfig (config) {
  let userConfig;
  if (typeof config.args.config === 'object') {
    userConfig = config.args.config;
  } else {
    userConfig = require(config.backstopConfigFileName);
  }
  const globalRetry = userConfig.retry || (userConfig.scenarioDefaults && userConfig.scenarioDefaults.retry) || 0;

  // Build a map of scenario label -> retry count (supports per-scenario override)
  const scenarioRetryMap = {};
  (userConfig.scenarios || []).forEach(s => {
    scenarioRetryMap[s.label] = s.retry != null ? s.retry : globalRetry;
  });

  return { globalRetry, scenarioRetryMap };
}

// This task will generate a date-named directory with DOM screenshot files as specified in `./capture/config.json` followed by running a report.
// NOTE: If there is no bitmaps_reference directory or if the bitmaps_reference directory is empty then a new batch of reference files will be generated in the bitmaps_reference directory.  Reporting will be skipped in this case.
module.exports = {
  execute: function (config) {
    const executeCommand = require('./index');
    if (shouldRunDocker(config)) {
      return runDocker(config, 'test')
        .finally(() => {
          if (config.openReport && config.report && config.report.indexOf('browser') > -1) {
            executeCommand('_openReport', config);
          }
        });
    } else {
      return createBitmaps(config, false).then(function () {
        return compare(config).then(async function (report) {
          const { globalRetry, scenarioRetryMap } = getRetryConfig(config);
          const maxRetry = Math.max(globalRetry, ...Object.values(scenarioRetryMap));

          if (maxRetry > 0 && report.failed() > 0) {
            for (let attempt = 1; attempt <= maxRetry; attempt++) {
              // Retry all failed scenarios (visual mismatches and capture errors)
              const failedLabels = new Set();
              report.tests.forEach(test => {
                if (!test.passed()) {
                  const allowed = scenarioRetryMap[test.pair.label] != null
                    ? scenarioRetryMap[test.pair.label]
                    : globalRetry;
                  if (attempt <= allowed) {
                    failedLabels.add(test.pair.label);
                  }
                }
              });
              if (failedLabels.size === 0) break;

              logger.log(`Visual mismatch retry attempt ${attempt} for ${failedLabels.size} failed scenario(s)`);

              // Re-capture only failed scenarios using a filter, same output directory
              const retryConfig = cloneDeep(config);
              retryConfig.args = Object.assign({}, config.args, {
                filter: [...failedLabels].map(l => `^${l.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`).join(',')
              });

              await createBitmaps(retryConfig, false);
              // Clear require cache so compare reads the updated file
              delete require.cache[require.resolve(config.tempCompareConfigFileName)];
              const retryReport = await compare(config);

              // Merge: replace results for retried scenarios with new results
              const keptTests = report.tests.filter(t => !failedLabels.has(t.pair.label));
              report.tests = keptTests.concat(retryReport.tests);
            }
          }

          return executeCommand('_report', config, report);
        });
      });
    }
  }
};
