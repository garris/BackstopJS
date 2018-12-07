// Go get a hook to BackstopJS
const backstop = require('../../../backstopjs');

// Run BackstopJS with docker
// NOTE: passing config file name is supported -- passing actual config data is not supported.
backstop('test', {
  docker: true,
  config: 'backstop_alt'
}).then(
  () => console.log('nothing new'),
  () => console.log('changes found')
);
