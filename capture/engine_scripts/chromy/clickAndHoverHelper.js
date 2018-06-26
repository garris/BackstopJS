module.exports = function (chromy, scenario) {
  var hoverSelector = scenario.hoverSelector;
  var clickSelector = scenario.clickSelector;
  var scrollToSelector = scenario.scrollToSelector;
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

  if (scrollToSelector) {
    chromy
      .wait(scrollToSelector)
      .evaluate(function() {
        document.querySelector(scrollToSelector).scrollIntoView();
      }, scrollToSelector);
  }

  if (postInteractionWait) {
    chromy.wait(postInteractionWait);
  }
};
