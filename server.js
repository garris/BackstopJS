var express = require('express')
	,app 	= express()
	,bunyan = require('bunyan')
	,_ = require('underscore')
	,util 	= require('util')
	,os 	= require('os')
	,sys = require('sys')
	,exec = require('child_process').exec;

var autoShutDownMs = 1000 * 60 * 15;//set to 0 to never auto-shutdown
var rootDir = __dirname;
var port 	= 3000;


app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(rootDir));

// app.all('/app/',function(req,res){
// 	console.log(new Date());
// 	exec("gulp test",puts);
// 	res.send('ok');
// })



var listenerHook = app.listen(port);


//===================
console.log()
console.log('Current Directory: '+__dirname)
console.log('Serving files from: '+rootDir)
console.log('Listening on: ' + getAddresses() + ':' + port + '');
console.log('Press Ctrl + C to stop.');


if(autoShutDownMs>0){
	
	setTimeout(function(){
		console.log('\nServer is going to auto-shutdown now.\n');
		listenerHook.close();
	}, autoShutDownMs);

	console.log('\nPLEASE NOTE: THIS SERVER WILL AUTOMATICLY SHUT DOWN IN ' + Math.round(autoShutDownMs/60000 * 100) / 100+ ' MINS.\n')
}



//=====================
function getAddresses(){
	var interfaces = os.networkInterfaces(),
		addresses = [];
	
	_.each(interfaces,function(net){
		_.each(net,function(address){
			if (address.family == 'IPv4' && !address.internal) addresses.push(address.address);
		})
	})

	return addresses;
}



function puts(error, stdout, stderr) {sys.puts(stdout)}



