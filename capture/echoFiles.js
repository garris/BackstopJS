
var fs = require('fs');



var bitmaps_reference = 'bitmaps_reference';
var bitmaps_test = 'bitmaps_test';
var compareConfigFileName = 'compare/config.json'
var genConfigPath = 'capture/config.json'


var configJSON = fs.read(genConfigPath);
var config = JSON.parse(configJSON);

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
	// casper.viewport(1280,1024);


	casper.each(scenarios,function(casper, scenario, scenario_index){

		if (scenario.cookiesJsonFile && fs.isFile(scenario.cookiesJsonFile)) {
			var cookiesJson = fs.read(scenario.cookiesJsonFile);
			var cookies = JSON.parse(cookiesJson);
			for (var i = 0; i < cookies.length; i++) {
				phantom.addCookie(cookies[i]);
			}
		}

		// casper.each(viewports, function(casper, vp, viewport_index) {
			// this.then(function() {
			// 	this.viewport(vp.viewport.width, vp.viewport.height);
			// });

			console.log('LOG> CASPER IS RUNNING')
			casper.thenOpen(scenario.url, function() {
				console.log('LOG> PHANTOM IS RUNNING')
				casper.wait(500);
			});
			casper.then(function() {
				this.echo('\n==================\nCurrent location is ' + scenario.url +'\n==================\n', 'warn');

				// var src = this.evaluate(function() {return document.body.outerHTML; });
				var src = this.evaluate(function() {return document.all[0].outerHTML; });
				this.echo('\n\n'+src);
			});

			// this.then(function(){

			// 	this.echo('Screenshots for ' + vp.name + ' (' + vp.viewport.width + 'x' + vp.viewport.height + ')', 'info');

			// 	//HIDE SELECTORS WE WANT TO AVOID
			// 	scenario.hideSelectors.forEach(function(o,i,a){
			// 		casper.evaluate(function(o){
			// 			document.querySelector(o).style.visibility='hidden';
			// 		},o);
			// 	});

			// 	//REMOVE UNWANTED SELECTORS FROM RENDER TREE
			// 	scenario.removeSelectors.forEach(function(o,i,a){
			// 		casper.evaluate(function(o){
			// 			document.querySelector(o).style.display='none';
			// 		},o);
			// 	});

			// 	//CREATE SCREEN SHOTS AND TEST COMPARE CONFIGURATION (CONFIG FILE WILL BE SAVED WHEN THIS PROCESS RETURNS)
			// 	scenario.selectors.forEach(function(o,i,a){
			// 		var cleanedSelectorName = o.replace(/[^a-zA-Z\d]/,'');//remove anything that's not a letter or a number
			// 		//var cleanedUrl = scenario.url.replace(/[^a-zA-Z\d]/,'');//remove anything that's not a letter or a number
			// 		var fileName = scenario_index + '_' + i + '_' + cleanedSelectorName + '_' + viewport_index + '_' + vp.name + '.png';;

			// 		var reference_FP 	= bitmaps_reference + '/' + fileName;
			// 		var test_FP 			= bitmaps_test + '/' + screenshotDateTime + '/' + fileName;

			// 		var filePath 			= (isReference)?reference_FP:test_FP;

			// 		if(!isReference)
			// 			compareConfig.testPairs.push({
			// 				reference:reference_FP,
			// 				test:test_FP,
			// 				selector:o,
			// 				fileName:fileName,
			// 				testName:scenario.testName
			// 			})

			// 		casper.captureSelector(filePath, o);
			// 		//casper.echo('remote capture to > '+filePath,'info');

			// 	});//end topLevelModules.forEach
			// });


		// });//end casper.each viewports

	});//end casper.each scenario

}


//========================
//this query should be moved to the prior process
//`isReference` could be better passed as env parameter
var exists = fs.exists(bitmaps_reference);
var isReference = false;
if(!exists){isReference=true; console.log('CREATING NEW REFERENCE FILES')}
//========================



// ==== NOTE -- want to test for page existence and then run this against all selectors
// ==== if pass then run the next blocks capturePageSelectors() && casper.run()
// casper.test.begin('assertExists() tests', 1, function(test) {
//     casper.start().then(function() {
//         this.setContent('<div class="heaven">beer</div>');
//         test.assertExists('.heaven');
//     }).run(function() {
//         test.done();
//     });
// });


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
	var configData = JSON.stringify(compareConfig,null,2);
	fs.write(compareConfigFileName, configData, 'w');
	console.log(
		'\n======================\nechoFiles has completed \n=======================\n'
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

