report({
  "testSuite": "BackstopJS",
  "tests": [
    {
      "pair": {
        "reference": "../bitmaps_reference/backstop_default_BackstopJS_Services_0_services_0_tablet.png",
        "test": "../bitmaps_test/20170924-181906/backstop_default_BackstopJS_Services_0_services_0_tablet.png",
        "selector": "#services",
        "fileName": "backstop_default_BackstopJS_Services_0_services_0_tablet.png",
        "label": "BackstopJS Services",
        "requireSameDimensions": true,
        "misMatchThreshold": 0.1,
        "diff": {
          "isSameDimensions": true,
          "dimensionDifference": {
            "width": 0,
            "height": 0
          },
          "misMatchPercentage": "0.08",
          "analysisTime": 92,
          "getDiffImage": null
        }
      },
      "status": "pass"
    },
    {
      "pair": {
        "reference": "../bitmaps_reference/backstop_default_BackstopJS_Banner_0_header_0_tablet.png",
        "test": "../bitmaps_test/20170924-181906/backstop_default_BackstopJS_Banner_0_header_0_tablet.png",
        "selector": "header",
        "fileName": "backstop_default_BackstopJS_Banner_0_header_0_tablet.png",
        "label": "BackstopJS Banner",
        "requireSameDimensions": true,
        "misMatchThreshold": 0.1,
        "diff": {
          "isSameDimensions": false,
          "dimensionDifference": {
            "width": 0,
            "height": -190
          },
          "misMatchPercentage": "41.16",
          "analysisTime": 195,
          "getDiffImage": null
        },
        "diffImage": "../bitmaps_test/20170924-181906/failed_diff_backstop_default_BackstopJS_Banner_0_header_0_tablet.png"
      },
      "status": "fail"
    }
  ]
});
