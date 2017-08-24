module.exports = function(chromy, scenario) {
  var hoverSelector = scenario.hoverHelperSelector,
      clickSelector = scenario.clickHelperSelector,
      postInteractionWait = scenario.postInteractionSelector,
      postInteractionText = scenario.postInteractionText;

  if (hoverSelector) {
    chromy
      .wait(hoverSelector)
      .wait(1000)
      .rect(hoverSelector)
      .result(function (rect) {
        chromy.mouseMoved(rect.left, rect.top)
      })
  }

  if (clickSelector) {
    chromy
      .wait(clickSelector)
      .click(clickSelector)
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
