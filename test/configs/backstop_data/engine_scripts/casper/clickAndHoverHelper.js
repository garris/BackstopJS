var WAIT_TIMEOUT = 5000;

module.exports = function (casper, scenario) {
  const waitFor = require('./waitForHelperHelper')(casper, WAIT_TIMEOUT);
  const hoverSelector = scenario.hoverSelector;
  const clickSelector = scenario.clickSelector;
  const postInteractionWait = scenario.postInteractionWait;

  if (hoverSelector) {
    waitFor(hoverSelector);
    casper.then(function () {
      casper.mouse.move(hoverSelector);
    });
  }

  if (clickSelector) {
    waitFor(clickSelector);
    casper.then(function () {
      casper.click(clickSelector);
    });
  }

  // TODO: if postInteractionWait === integer then do ==> wait(postInteractionWait) || elsevvv
  waitFor(postInteractionWait);
};
