module.exports = function (chromy, scenario) {
  const hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  const focusSelector = scenario.focusSelectors || scenario.focusSelector;
  const clickSelector = scenario.clickSelectors || scenario.clickSelector;
  const scrollToSelector = scenario.scrollToSelectors || scenario.scrollToSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    chromy
      .wait(hoverSelector)
      .rect(hoverSelector)
      .result((rect) => {
        chromy.mouseMoved(rect.left, rect.top);
      });
  }

  if (focusSelector) {
    chromy
      .wait(focusSelector)
      .focus(focusSelector);
  }

  if (clickSelector) {
    chromy
      .wait(clickSelector)
      .click(clickSelector);
  }

  if (postInteractionWait) {
    chromy.wait(postInteractionWait);
  }

  if (scrollToSelector) {
    chromy
      .wait(scrollToSelector)
      .evaluate(`window._scrollToSelector = '${scrollToSelector}'`)
      .evaluate(() => {
        document.querySelector(window._scrollToSelector).scrollIntoView();
      });
  }
};
