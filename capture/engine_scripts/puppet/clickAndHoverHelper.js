module.exports = async (page, scenario) => {
  var hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  var clickSelector = scenario.clickSelectors || scenario.clickSelector;
  var scrollToSelector = scenario.scrollToSelectors || scenario.scrollToSelector;
  var postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    for (const hoverSelectorIndex of [].concat(hoverSelector)) {
      await page.waitFor(hoverSelectorIndex);
      await page.hover(hoverSelectorIndex);
    }
  }

  if (clickSelector) {
    for (const clickSelectorIndex of [].concat(clickSelector)) {
      await page.waitFor(clickSelectorIndex);
      await page.click(clickSelectorIndex);
    }
  }
  
  if (scrollToSelector) {
    for (const scrollToSelectorIndex of [].concat(scrollToSelector)) {
      await page.waitFor(scrollToSelectorIndex);
      await page.evaluate(scrollToSelectorIndex => {
        document.querySelector(scrollToSelectorIndex).scrollIntoView();
      }, scrollToSelectorIndex);
    }
  }

  if (postInteractionWait) {
    await page.waitFor(postInteractionWait);
  }
};
