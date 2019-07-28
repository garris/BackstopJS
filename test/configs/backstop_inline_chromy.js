module.exports = {
  id: `backstop_inline_chromy`,
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
  onBeforeScript: `chromy/onBefore.js`,
  onReadyScript: `chromy/onReady.js`,
  scenarios: [
    {
      label: 'Simple ',
      url: 'https://garris.github.io/BackstopJS/',
      onReadyScript: chromy => {
        console.log('INLINE FUNCTION CHROMY');
        const hoverSelector = '.chromy:nth-child(2)';

        chromy
          .wait(hoverSelector)
          .rect(hoverSelector)
          .result(function (rect) {
            chromy.mouseMoved(rect.left, rect.top);
          });
      },
      selectors: ['.chromy:nth-child(2)']
    }
  ],
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report'
  },
  report: ['browser'],
  engine: 'chrome',
  engineOptions: {
    args: ['--no-sandbox']
  },
  asyncCaptureLimit: 10,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
};
