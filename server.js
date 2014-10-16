var express = require('express')
	,app 	= express()
	,bunyan = require('bunyan')
	,_ = require('underscore')
	,util 	= require('util')
	,os 	= require('os')
	,sys = require('sys')
	,exec = require('child_process').exec;


var rootDir = __dirname;
var port 	= 3000;


app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(rootDir));

app.all('/app/',function(req,res){
	console.log(new Date());
	exec("gulp test",puts);
	res.send('ok');
})



app.listen(port);


//===================
console.log()
console.log('Current Directory: '+__dirname)
console.log('Serving files from: '+rootDir)
console.log('Listening on: ' + getAddresses() + ':' + port + '');
console.log('Press Ctrl + C to stop.');





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



