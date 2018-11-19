module.exports = async (page, scenario) => {
  var hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  var clickSelector = scenario.clickSelectors || scenario.clickSelector;
  var keyPressSelector = scenario.keyPressSelectors || scenario.keyPressSelector;
  var scrollToSelector = scenario.scrollToSelector;
  var postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (keyPressSelector) {
    for (const keyPressSelectorItem of [].concat(keyPressSelector)) {
      await page.waitFor(keyPressSelectorItem.selector);
      await page.type(keyPressSelectorItem.selector, keyPressSelectorItem.keyPress);
    }
  }

  if (hoverSelector) {
    await page.waitFor(hoverSelector);
    await page.hover(hoverSelector);
  }

  if (clickSelector) {
    await page.waitFor(clickSelector);
    await page.click(clickSelector);
  }

  if (postInteractionWait) {
    await page.waitFor(postInteractionWait);
  }

  if (scrollToSelector) {
    await page.waitFor(scrollToSelector);
    await page.evaluate(scrollToSelector => {
      document.querySelector(scrollToSelector).scrollIntoView();
    }, scrollToSelector);
  }
};
