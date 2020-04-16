const assert = require('assert');
const { modifyJsonpReportHelper } = require('../../../core/util/remote');

const originalJsonpReport = `report({
  "tests": [
    {
      "pair": {
        "fileName": "scenario_1.png"
      },
      "status": "pass"
    },
    {
      "pair": {
        "fileName": "scenario_2.png",
        "diffImage": "../bitmaps_test/20200217-233748/failed_diff_scenario_2.png"
      },
      "status": "fail"
    }
  ]
});`;

const expectedJsonpReport = `report({
  "tests": [
    {
      "pair": {
        "fileName": "scenario_1.png"
      },
      "status": "pass"
    },
    {
      "pair": {
        "fileName": "scenario_2.png"
      },
      "status": "pass"
    }
  ]
});`;

describe('Util | remote', function () {
  it('should change the approved test status to "pass"', function () {
    const jsonpReport = modifyJsonpReportHelper(originalJsonpReport, 'scenario_2.png');
    assert.deepStrictEqual(jsonpReport, expectedJsonpReport);
  });
});
