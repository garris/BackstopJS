module.exports = function(casper, scenario, vp) {
  casper.evaluate(function(){
    console.log('onReady.global.js');
  });
  casper.wait(50);
};
