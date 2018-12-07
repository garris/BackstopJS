const ENGINE = 'puppet';
const SCRIPT_PATH = 'puppet';

module.exports = {
  id: `${ENGINE}_special_cases`,
  viewports: [
    {
      label: 'phone',
      width: 320,
      height: 480
    },
    {
      label: 'tablet',
      width: 1024,
      height: 768
    }
  ],
  onBeforeScript: `${SCRIPT_PATH}/onBefore.js`,
  onReadyScript: `${SCRIPT_PATH}/onReady.js`,
  scenarios: [
    {
      label: 'scrollTo',
      url: './scrollToSelector.html',
      scrollToSelector: '.lemurFace',
      selectors: ['.lemurFace']
    }
  ],
  paths: {
    bitmaps_reference: '../backstop_data/bitmaps_reference',
    bitmaps_test: '../backstop_data/bitmaps_test',
    engine_scripts: '../backstop_data/engine_scripts',
    html_report: '../backstop_data/html_report',
    ci_report: '../backstop_data/ci_report'
  },
  report: ['browser'],
  engine: ENGINE,
  engineOptions: {},
  asyncCaptureLimit: 10,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
};
