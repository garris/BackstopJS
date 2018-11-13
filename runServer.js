var static = require('node-static');
const backstop = require('../backstopjs');

var file = new static.Server('./static');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8080);


backstop('test', {
  docker: true,
  config: './test/configs/backstop_features'
}).then(
  () => process.exit(),
  () => process.exit(1)
);
