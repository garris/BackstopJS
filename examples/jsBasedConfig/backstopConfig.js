module.exports = {
  id: 'test',
  viewports: [
    {
      name: 'phone',
      width: 320,
      height: 480
    },
    {
      name: 'tablet_v',
      width: 568,
      height: 1024
    },
    {
      name: 'tablet_h',
      width: 1024,
      height: 768
    }
  ],
  scenarios: [
    {
      label: 'My Homepage',
      url: 'https://garris.github.io/BackstopJS/',
      hideSelectors: [],
      removeSelectors: [],
      selectorExpansion: true,
      selectors: [
        'body',
        '.jumbotron',
        '.firstPanel > div',
        '.secondPanel'
      ],
      readyEvent: null,
      delay: 500,
      misMatchThreshold: 0.1,
      onBeforeScript: 'onBefore.js',
      onReadyScript: 'onReady.js'
    }
  ],
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report'
  },
  report: ['browser'],
  debug: false
};
