

var fs = require('fs');

var genConfigPath = 'capture/config.json'
var configJSON = fs.read(genConfigPath);
var config = JSON.parse(configJSON);

var viewports = config.viewports;
var grabConfigs = config.grabConfigs;

var bitmaps_reference = 'bitmaps_reference';
var bitmaps_test = 'bitmaps_test';
var compareConfigFileName = 'compare/config.json'

var compareConfig = {testPairs:[]};

var casper = require("casper").create();

casper.on('resource.received', function(resource) {
		//casper.echo(resource.url);
});

casper.on("page.error", function(msg, trace) {
	// this.echo("Remote Error >    " + msg, "error");
	// this.echo("file:     " + trace[0].file, "WARNING");
	// this.echo("line:     " + trace[0].line, "WARNING");
	// this.echo("function: " + trace[0]["function"], "WARNING");
	//errors.push(msg);
});

casper.on('remote.message', function(message) {
	this.echo('remote console > ' + message);
});

casper.on('resource.received', function(resource) {
	var status = resource.status;
	if(status >= 400) {
		casper.log('remote error > ' + resource.url + ' failed to load (' + status + ')', 'error');
		resourceErrors.push({
			url: resource.url,
			status: resource.status
		});
	}
});



function capturePageSelectors(url,grabConfigs,viewports,bitmaps_reference,bitmaps_test,isReference){

	var 
		screenshotNow = new Date(),
		screenshotDateTime = screenshotNow.getFullYear() + pad(screenshotNow.getMonth() + 1) + pad(screenshotNow.getDate()) + '-' + pad(screenshotNow.getHours()) + pad(screenshotNow.getMinutes()) + pad(screenshotNow.getSeconds());

	casper.start();
	// casper.viewport(1280,1024);
	


	casper.each(grabConfigs,function(casper, grabConfig, grabConfig_index){


		casper.each(viewports, function(casper, vp, viewport_index) {
			this.then(function() {
				this.viewport(vp.viewport.width, vp.viewport.height);
			});
			this.thenOpen(grabConfig.url, function() {
				this.wait(500);
			});
			casper.then(function() {
				this.echo('Current location is ' + grabConfig.url, 'info');

		    //var src = this.evaluate(function() {return document.body.outerHTML; });
		    //this.echo(src);
			});

			this.then(function(){

				this.echo('Screenshots for ' + vp.name + ' (' + vp.viewport.width + 'x' + vp.viewport.height + ')', 'info');

				grabConfig.selectors.forEach(function(o,i,a){
					var cleanedSelectorName = o.replace(/[^a-zA-Z\d]/,'');//remove anything that's not a letter or a number 				
					//var cleanedUrl = grabConfig.url.replace(/[^a-zA-Z\d]/,'');//remove anything that's not a letter or a number
					var fileName = grabConfig_index + '_' + i + '_' + cleanedSelectorName + '_' + viewport_index + '_' + vp.name + '.png';;

					var reference_FP 	= bitmaps_reference + '/' + fileName;
					var test_FP 			= bitmaps_test + '/' + screenshotDateTime + '/' + fileName;

					var filePath 			= (isReference)?reference_FP:test_FP;

					if(!isReference)
						compareConfig.testPairs.push({
							reference:reference_FP,
							test:test_FP,
							selector:o,
							fileName:fileName,
							testName:grabConfig.testName
						})

					casper.captureSelector(filePath, o);
					//casper.echo('remote capture to > '+filePath,'info');
				
				});//end topLevelModules.forEach
			});
			
			
		});//end casper.each viewports

	});//end casper.each grabConfig

}




var exists = fs.exists(bitmaps_reference);
var isReference = false;
if(!exists){isReference=true; console.log('CREATING NEW REFERENCE FILES')}

capturePageSelectors(
	'index.html'
	,grabConfigs
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
	var configData = JSON.stringify(compareConfig,null,2);
	fs.write(compareConfigFileName, configData, 'w');
	console.log(
		'complete'
		//,configData
	);
}

function pad(number) {
	var r = String(number);
	if ( r.length === 1 ) {
		r = '0' + r;
	}
	return r;
}