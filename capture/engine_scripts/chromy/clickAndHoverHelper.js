module.exports = function (chromy, scenario) {
  const hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  const clickSelector = scenario.clickSelectors || scenario.clickSelector;
  const keyPressSelector = scenario.keyPressSelectors || scenario.keyPressSelector;
  const scrollToSelector = scenario.scrollToSelectors || scenario.scrollToSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (keyPressSelector) {
    for (const keyPressSelectorItem of [].concat(keyPressSelector)) {
      chromy
        .wait(keyPressSelectorItem.selector)
        .insert(keyPressSelectorItem.selector, keyPressSelectorItem.keyPress);
    }
  }

  if (hoverSelector) {
    chromy
      .wait(hoverSelector)
      .rect(hoverSelector)
      .result((rect) => {
        chromy.mouseMoved(rect.left, rect.top);
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

  if (scrollToSelector) {
    chromy
      .wait(scrollToSelector)
      .evaluate(`window._scrollToSelector = '${scrollToSelector}'`)
      .evaluate(() => {
        document.querySelector(window._scrollToSelector).scrollIntoView();
      });
  }
};
