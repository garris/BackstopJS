module.exports = async (browser, scenario) => {
  const hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  const clickSelector = scenario.clickSelectors || scenario.clickSelector;
  const keyPressSelector = scenario.keyPressSelectors || scenario.keyPressSelector;
  const scrollToSelector = scenario.scrollToSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (keyPressSelector) {
    for (const keyPressSelectorItem of [].concat(keyPressSelector)) {
      await browser.$(keyPressSelectorItem.selector).waitForDisplayed();
      const input = browser.$(keyPressSelectorItem.selector);
      input.setValue(keyPressSelectorItem.keyPress);
    }
  }

  if (hoverSelector) {
    for (const hoverSelectorIndex of [].concat(hoverSelector)) {
      await browser.$(hoverSelectorIndex).waitForDisplayed();
      browser.$(hoverSelectorIndex).moveTo();
    }
  }

  if (clickSelector) {
    for (const clickSelectorIndex of [].concat(clickSelector)) {
      await browser.$(clickSelectorIndex).waitForDisplayed();
      const clickElement = browser.$(clickSelectorIndex);
      clickElement.click();
    }
  }

  if (postInteractionWait) {
    await browser.$(postInteractionWait).waitForDisplayed();
  }

  if (scrollToSelector) {
    await browser.$(scrollToSelector).waitForDisplayed();

    await browser.execute(scrollToSelector => {
      document.querySelector(scrollToSelector).scrollIntoView();
    }, scrollToSelector);
  }
};
