var fs = require('fs');

var genConfigPath = 'capture/config.json'
var configJSON = fs.read(genConfigPath);
var config = JSON.parse(configJSON);
if (!config.paths) {
  config.paths = {};
}

var bitmaps_reference = config.paths.bitmaps_reference || 'bitmaps_reference';
var bitmaps_test = config.paths.bitmaps_test || 'bitmaps_test';
var compareConfigFileName = config.paths.compare_data || 'compare/config.json';
var viewports = config.viewports;
var scenarios = config.scenarios||config.grabConfigs;

var compareConfig = {testPairs:[]};
if (config.misMatchThreshold) {
    compareConfig.misMatchThreshold = config.misMatchThreshold;
}

var casper = require("casper").create({
  // clientScripts: ["jquery.js"] //lets try not to use this it's friggin 2014 already people...
});

casper.on('resource.received', function(resource) {
    //casper.echo(resource.url);
});

casper.on("page.error", function(msg, trace) {
  // this.echo("Remote Error >    " + msg, "error");
  // this.echo("file:     " + trace[0].file, "WARNING");
  // this.echo("line:     " + trace[0].line, "WARNING");
  // this.echo("function: " + trace[0]["function"], "WARNING");
});

casper.on('remote.message', function(message) {
  this.echo('remote console > ' + message);
});

casper.on('resource.received', function(resource) {
  var status = resource.status;
  if(status >= 400) {
    casper.log('remote error > ' + resource.url + ' failed to load (' + status + ')', 'error');
  }
});

function capturePageSelectors(url,scenarios,viewports,bitmaps_reference,bitmaps_test,isReference){
  var
    gotErrors = [],
    screenshotNow = new Date(),
    screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());

  casper.start();

  casper.each(scenarios,function(casper, scenario, scenario_index) {
    if (scenario.cookiesJsonFile && fs.isFile(scenario.cookiesJsonFile)) {
      var cookiesJson = fs.read(scenario.cookiesJsonFile);
      var cookies = JSON.parse(cookiesJson);
      for (var i = 0; i < cookies.length; i++) {
        phantom.addCookie(cookies[i]);
      }
    }

    console.log('LOG> CASPER IS RUNNING');
    
    casper.thenOpen(scenario.url, function() {
      console.log('LOG> PHANTOM IS RUNNING');
      casper.wait(100);
    });
    
    casper.then(function() {
      this.echo('\n==================\nCurrent location is ' + scenario.url +'\n==================\n', 'warn');
      // var src = this.evaluate(function() {return document.body.outerHTML; });
      var src = this.evaluate(function() {return document.all[0].outerHTML; });
      this.echo('\n\n'+src);
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


capturePageSelectors(
  'index.html'
  ,scenarios
  ,viewports
  ,bitmaps_reference
  ,bitmaps_test
  ,isReference
);

casper.run(function(){
  complete();
  this.exit();
});

function complete(){
  console.log('\n======================\nechoFiles has completed \n=======================\n');
}

function pad(number) {
  var r = String(number);
  if ( r.length === 1 ) {
    r = '0' + r;
  }
  return r;
}
