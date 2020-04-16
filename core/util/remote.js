const fs = require('./fs');

/**
 * Extract jsonReport from the jsonpReport
 *
 * @param {String} jsonpReport - jsonpReport `report(${jsonReport});`
 * @return {Object} an object of jsonReport
 */
function extractReport (jsonpReport) {
  const jsonReport = jsonpReport.substring(7, jsonpReport.length - 2);
  return JSON.parse(jsonReport);
}

/**
 * Helper function to modify the test status of the JSONP report based on the approved file name.
 *
 * @param {String} originalJsonpReport - jsonpReport `report(${jsonReport});`
 * @param {String} approvedFileName - the name of the screenshot that is approved
 * @return {String} jsonpReport - modified jsonpReport
 */
function modifyJsonpReportHelper (originalJsonpReport, approvedFileName) {
  const report = extractReport(originalJsonpReport);
  report.tests.forEach(test => {
    if (test.pair.fileName === approvedFileName) {
      test.status = 'pass';
      delete test.pair.diffImage;
    }
    return test;
  });

  const jsonReport = JSON.stringify(report, null, 2);
  const jsonpReport = `report(${jsonReport});`;
  return jsonpReport;
}

/**
 * Modify the test status of the JSONP report based on the approved file name. JSONP is used
 * to create the Backstop report in browser. This function ensures the UI consistency after
 * a user apporves a test in browser and refreshes the report without running a test.
 *
 * @param {Object} params - the input params
 * @param {String} params.reportConfigFilename - the path to the html report config file
 * @param {String} params.approvedFileName - the name of the screenshot that is approved
 * @return {Promise}
 */
async function modifyJsonpReport ({ reportConfigFilename, approvedFileName }) {
  return fs
    .readFile(reportConfigFilename, 'utf8')
    .then(content => {
      const jsonpReport = modifyJsonpReportHelper(content[0], approvedFileName);
      return fs.writeFile(reportConfigFilename, jsonpReport);
    })
    .catch(err => {
      throw new Error(`Failed to modify the report. ${err.message}.`);
    });
}

module.exports = {
  modifyJsonpReport,
  modifyJsonpReportHelper
};
