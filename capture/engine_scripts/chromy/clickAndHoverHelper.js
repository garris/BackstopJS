module.exports = function (chromy, scenario) {
  var hoverSelector = scenario.hoverSelector;
  var clickSelector = scenario.clickSelector;
  var postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    chromy
      .wait(hoverSelector)
      .rect(hoverSelector)
      .result(function (rect) {
        chromy.mouseMoved(rect.left + rect.width/2, rect.top + rect.height/2);
      });
  }

  if (clickSelector) {
    chromy
      .wait(clickSelector)
      .click(clickSelector);
  }

  if (postInteractionWait) {
    chromy.wait(postInteractionWait);
  }
};
