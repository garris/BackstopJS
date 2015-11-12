module.exports = function(casper, scenario, vp) {
  casper.evaluate(function(){
    console.log('This custom script is running inside your web app!');
    console.log('Add your own casper commands here to simulate user interacions or logging in.');
  });
  casper.wait(50);
};
