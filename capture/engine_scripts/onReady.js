module.exports = function (engine, scenario, vp) {
  engine.evaluate(function () {
    // Your web-app is now loaded. Edit here to simulate user interacions or other state changes.
  });
  console.log('onReady.js has run for: ', vp.label);
};
