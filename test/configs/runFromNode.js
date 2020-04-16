// Go get a hook to BackstopJS
const backstop = require('../../core/runner');

// Run BackstopJS with docker
// NOTE: passing either config file name or actual config object is supported.
backstop('test', {
  docker: true,
  config: 'backstop_alt',
  filter: undefined
}).then(
  () => console.log('nothing new'),
  () => console.log('changes found')
);
