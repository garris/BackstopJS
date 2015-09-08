var express = require('express'),
    app     = express(),
    _       = require('underscore'),
    os      = require('os'),
    sys     = require('sys'),
    exec    = require('child_process').exec,
    argv    = require('yargs').argv;

var autoShutDownMs = (Number(argv.t) === argv.t && argv.t % 1 === 0) ? 1000 * 60 * argv.t : 1000 * 60 * 15;
var rootDir = __dirname;
var port  = 3001;

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(rootDir));

// app.all('/app/',function(req,res){
//  console.log(new Date());
//  exec("gulp test",puts);
//  res.send('ok');
// })

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

  console.log('\n['+new Date()+'] PLEASE NOTE: THIS SERVER WILL AUTOMATICALLY SHUT DOWN IN ' + Math.round(autoShutDownMs/60000 * 100) / 100+ ' MINS.\n')
}

//=====================
function getAddresses(){
  var interfaces = os.networkInterfaces(),
    addresses = [];

  _.each(interfaces,function(net) {
    _.each(net,function(address) {
      if (address.family == 'IPv4' && !address.internal) addresses.push(address.address);
    });
  });

  return addresses;
}

function puts(error, stdout, stderr) {sys.puts(stdout)}



