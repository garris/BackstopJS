var casper = require('casper').create();



var consoleBuffer = '';
var regExReadyStr = 'Backstop.Ready'
var regExReadyFlag = new RegExp(regExReadyStr,'i');
var scriptTimeout = 20000;

casper.on('remote.message', function(message) {
    this.echo(message);
    consoleBuffer = consoleBuffer + '\n' + message;
});

casper.start('simple.html');

casper.waitFor(
	function(){return consoleBuffer.search(regExReadyFlag)>=0;} //test
	,function(){casper.echo('DONE!');} //on done 
	,function(){casper.echo('ERROR: casper timeout.')} //on timeout
	,scriptTimeout
)

casper.run();



