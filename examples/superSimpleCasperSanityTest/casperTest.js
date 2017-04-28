var casper = require('casper').create({
  verbose: false,
  logLevel: 'debug'
});

casper.echo('starting >');

casper.start('https://google.com/', function () {
  casper.viewport(1280, 800);
  casper.echo('page loaded >');
});

casper.options.onResourceReceived = function (C, response) {
  if (response.stage === 'end') {
    casper.echo('RESOURCE > ' + response.url);
  }
};

casper.on('resource.received', function (resource) {
  if (resource.stage === 'end') {
    casper.echo('RESOURCE > ' + resource.url);
  }
  var status = resource.status;
  if (status >= 400) {
    casper.echo('remote error > ' + resource.url + ' failed to load (' + status + ')', 'error');
  }
});

var consoleBuffer = '';
casper.on('remote.message', function (message) {
  casper.echo(message);
  consoleBuffer = consoleBuffer + '\n' + message;
});

// event listeners
casper.on('navigation.requested', function (reurl, navigationType, navigationLocked, isMainFrame) {
  casper.echo('> Trying to navigate to: ' + reurl);
});

casper.then(function () {
  casper.capture('screenshots/' + new Date().getTime().toString() + '.png');
});

casper.then(function () {
  casper.echo('screenshot created >');
});

casper.run();
