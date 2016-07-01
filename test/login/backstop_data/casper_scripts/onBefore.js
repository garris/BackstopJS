var logInObj = require('../../loginObj.json');
var pause_time = 1000;

module.exports = function(casper, scenario, vp) {
  casper.evaluate(function(){
    console.log('This custom script is running inside your web app!');
  });

  if (vp.name === "phone") {
    casper.thenOpen(logInObj.url);
    casper.wait(pause_time);// TODO: this should be wait-for-selector with continue on timeout
    casper.then(function() {
      if (casper.exists(logInObj.form_id)) {
        this.echo("AUTHENTICATING", 'INFO');
        this.fill(logInObj.form_id, logInObj.creds, true);
      }
    });
    casper.wait(pause_time);
  }
};
