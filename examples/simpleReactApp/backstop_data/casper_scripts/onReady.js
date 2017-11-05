module.exports = function (casper, scenario, vp) {
  casper.echo('onReady.js', 'INFO');
  casper.evaluate(function () {
    console.log('Your web-app is now loaded. Modify onReady.js to simulate user interactions or other state changes.');
  });
};
