module.exports = function (chromy, scenario) {
  var hoverSelector = scenario.hoverHelperSelector;
  var clickSelector = scenario.clickHelperSelector;
  var postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]
  var postInteractionText = scenario.postInteractionText;

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

  // // TODO: DONT KNOW IF THIS WORKS YET!
  // if (postInteractionText) {
  //   chromy
  //   .evaluate(`window._pageHasText = '${postInteractionText}'`)
  //   .wait(() => {
  //     return window.hasText(window._pageHasText);
  //   })
  // }

  if (postInteractionWait) {
    chromy.wait(postInteractionWait);
  }
};
