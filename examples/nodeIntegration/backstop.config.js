module.exports = options => {
  return {
    id: `${options.project}_test`,
    viewports: [
      {
        name: 'tablet',
        width: 1024,
        height: 768
      }
    ],
    scenarios: options.scenarios,
    paths: {
      bitmaps_reference: `backstop_data/${options.project}/bitmaps_reference`,
      bitmaps_test: `backstop_data/${options.project}/bitmaps_test`,
      html_report: `backstop_data/${options.project}/html_report`,
      ci_report: `backstop_data/${options.project}/ci_report`
    },
    report: ['browser', 'CI'],
    debug: false
  };
};
