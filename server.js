var express = require('express'),
	app = express(),
	_ = require('underscore'),
	os = require('os');

var autoShutDownMs = 1000 * 60 * 15;//set to 0 to never auto-shutdown
var rootDir = __dirname;
var port = 3001;


app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(rootDir));

var listenerHook = app.listen(port);


//===================
console.log();
console.log('Current Directory: '+__dirname);
console.log('Serving files from: '+rootDir);
console.log('Listening on: ' + getAddresses() + ':' + port + '');
console.log('Press Ctrl + C to stop.');


if(autoShutDownMs>0){

	setTimeout(function(){
		console.log('\n['+new Date()+'] Server is shutting down now. Bye!\n');
		listenerHook.close();
	}, autoShutDownMs);

	console.log('\n['+new Date()+'] PLEASE NOTE: THIS SERVER WILL AUTOMATICLY SHUT DOWN IN ' + Math.round(autoShutDownMs/60000 * 100) / 100 + ' MINS.\n');
}



//=====================
function getAddresses(){
	var interfaces = os.networkInterfaces(),
		addresses = [];

	_.each(interfaces,function(net){
		_.each(net,function(address){
			if (address.family === 'IPv4' && !address.internal) {
				addresses.push(address.address);
			}
		});
	});

	return addresses;
}
