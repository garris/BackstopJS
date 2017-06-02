const path = require('path');

module.exports = {
  id: 'Absolute Paths Example',
  viewports: [
    {
      name: 'phone',
      width: 320,
      height: 480
    }
  ],
  scenarios: [
    {
      label: 'Absolute Paths Example',
      url: 'http://localhost:8000/',
      selectors: [
        '.title'
      ]
    }
  ],
  paths: {
    bitmaps_reference: path.resolve(__dirname, 'backstop_data/bitmaps_reference'),
    bitmaps_test: path.resolve(__dirname, 'backstop_data/bitmaps_test')
  },
  engine: 'phantomjs',
  report: ['browser']
};
