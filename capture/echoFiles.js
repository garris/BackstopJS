/* eslint-disable no-path-concat */

var fs = require('fs');
var scriptName = fs.absolute(require('system').args[3]);
var __dirname = scriptName.substring(0, scriptName.lastIndexOf('/'));

var genConfigPath = __dirname + '/config.json'; // TODO :: find a way to use that directly from the main configuration
var config = require(genConfigPath);
if (!config.paths) {
  config.paths = {};
}

var scenarios = config.scenarios || config.grabConfigs;

var compareConfig = {testPairs: []};
if (config.misMatchThreshold) {
  compareConfig.misMatchThreshold = config.misMatchThreshold;
}

var casper = require('casper').create({
  logLevel: config.debug ? 'debug' : 'info',
  verbose: config.debug
});

casper.echo('-------');

casper.echo('Casper CLI passed args vvv');
require('utils').dump(casper.cli.args);

casper.echo('Casper CLI passed options vvv');
require('utils').dump(casper.cli.options);

casper.echo('-------');

casper.on('page.error', function (msg, trace) {
  this.echo('---');
  this.echo('vvv Remote Error  ' + msg, 'error');
  this.echo('file:     ' + trace[0].file, 'WARNING');
  this.echo('line:     ' + trace[0].line, 'WARNING');
  this.echo('function: ' + trace[0]['function'], 'WARNING');
  this.echo('---');
});

casper.on('remote.message', function (message) {
  this.echo('remote console > ' + message);
});

casper.on('resource.received', function (resource) {
  // casper.echo('resource.received > ' + resource.url);

  var status = resource.status;
  if (status >= 400) {
    casper.log('vvv remote error ' + resource.url + ' failed to load (' + status + ')', 'error');
  }
});

function capturePageSelectors (scenarios) {
  casper.start();

  casper.each(scenarios, function (casper, scenario) {
    console.log('LOG> CASPER IS RUNNING');

    casper.thenOpen(scenario.url, function () {
      console.log('LOG> PHANTOM IS RUNNING');
      casper.wait(100);
    });

    casper.then(function () {
      this.echo('\n==================\nCurrent location is ' + scenario.url + '\n==================\n', 'warn');
      var src = this.evaluate(function () { return document.all[0].outerHTML; });
      this.echo('\n\n' + src);
    });
  });// end casper.each scenario
}

capturePageSelectors(scenarios);

casper.run(function () {
  console.log('\n======================\nechoFiles has completed \n=======================\n');
  this.exit();
});
