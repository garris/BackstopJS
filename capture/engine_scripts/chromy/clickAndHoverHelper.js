module.exports = function (chromy, scenario) {
  var hoverSelector = scenario.hoverSelector;
  var clickSelector = scenario.clickSelector;
  var activeSelector = scenario.activeSelector;
  var postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    chromy
      .wait(hoverSelector)
      .rect(hoverSelector)
      .result(function (rect) {
        chromy.mouseMoved(rect.left, rect.top);
      });
  }

  if (clickSelector) {
    chromy
      .wait(clickSelector)
      .click(clickSelector);
  }

  if (activeSelector) {
    chromy
      .wait(activeSelector)
      .rect(activeSelector)
      .result(function (rect) {
        chromy.mousePressed(rect.left + rect.width/2, rect.top + rect.height/2);
      });
  }

  if (postInteractionWait) {
    chromy.wait(postInteractionWait);
  }
};
