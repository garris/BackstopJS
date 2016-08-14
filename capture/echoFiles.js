var fs = require('fs');
var __dirname = null;
var searchString = "echoFiles.js";
require('system').args.forEach(function(arg, i) {
  var position = arg.length - searchString.length;
  var lastIndex = arg.indexOf(searchString, position);
  if (lastIndex !== -1 && lastIndex === position) {
    __dirname = arg.replace(fs.separator + 'echoFiles.js', '');
  }
});

if (!__dirname) {
  console.log("Could not find dirname");
}

var genConfigPath = __dirname + '/config.json'; // TODO :: find a way to use that directly from the main configuration
var config = require(genConfigPath);
if (!config.paths) {
  config.paths = {};
}

var bitmaps_reference = config.paths.bitmaps_reference || 'bitmaps_reference';
var bitmaps_test = config.paths.bitmaps_test || 'bitmaps_test';
var scenarios = config.scenarios||config.grabConfigs;

var compareConfig = {testPairs:[]};
if (config.misMatchThreshold) {
    compareConfig.misMatchThreshold = config.misMatchThreshold;
}

var casper = require("casper").create({
  logLevel: config.debug? "debug" : "info",
  verbose: config.debug
});

casper.echo("-------");

casper.echo("Casper CLI passed args vvv");
require("utils").dump(casper.cli.args);

casper.echo("Casper CLI passed options vvv");
require("utils").dump(casper.cli.options);

casper.echo("-------");

casper.on("page.error", function(msg, trace) {
  this.echo('---');
  this.echo("vvv Remote Error  " + msg, "error");
  this.echo("file:     " + trace[0].file, "WARNING");
  this.echo("line:     " + trace[0].line, "WARNING");
  this.echo("function: " + trace[0]["function"], "WARNING");
  this.echo('---');
});

casper.on('remote.message', function(message) {
  this.echo('remote console > ' + message);
});

casper.on('resource.received', function(resource) {
  // casper.echo('resource.received > ' + resource.url);

  var status = resource.status;
  if(status >= 400) {
    casper.log('vvv remote error ' + resource.url + ' failed to load (' + status + ')', 'error');
  }
});

function capturePageSelectors(scenarios){
  casper.start();

  casper.each(scenarios, function(casper, scenario, scenario_index) {
    console.log('LOG> CASPER IS RUNNING');

    casper.thenOpen(scenario.url, function() {
      console.log('LOG> PHANTOM IS RUNNING');
      casper.wait(100);
    });

    casper.then(function() {
      this.echo('\n==================\nCurrent location is ' + scenario.url + '\n==================\n', 'warn');
      var src = this.evaluate(function() {return document.all[0].outerHTML; });
      this.echo('\n\n'+ src);
    });
  });//end casper.each scenario
}

//========================
//this query should be moved to the prior process
//`isReference` could be better passed as env parameter
var exists = fs.exists(bitmaps_reference);
var isReference = false;
if(!exists){isReference=true; console.log('CREATING NEW REFERENCE FILES')}
//========================

capturePageSelectors(scenarios);

casper.run(function(){
  console.log('\n======================\nechoFiles has completed \n=======================\n');
  this.exit();
});
