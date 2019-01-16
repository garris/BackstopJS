const ENGINE = 'puppet';

module.exports = {
  id: `${ENGINE}_output_format`,
  viewports: [
    {
      label: 'tablet',
      width: 1024,
      height: 768
    }
  ],
  scenarios: [
    {
      label: 'Simple',
      url: '../../../index.html'
    }
  ],
  paths: {
    bitmaps_reference: '../backstop_data/bitmaps_reference',
    bitmaps_test: '../backstop_data/bitmaps_test',
    engine_scripts: '../backstop_data/engine_scripts',
    html_report: '../backstop_data/html_report',
    ci_report: '../backstop_data/ci_report'
  },
  outputFormat: 'jpg',
  report: ['browser'],
  engine: ENGINE
};
