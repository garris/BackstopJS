module.exports = async (page, scenario) => {
  const hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  const focusSelector = scenario.focusSelectors || scenario.focusSelector;
  const clickSelector = scenario.clickSelectors || scenario.clickSelector;
  const scrollToSelector = scenario.scrollToSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    for (const hoverSelectorIndex of [].concat(hoverSelector)) {
      await page.waitFor(hoverSelectorIndex);
      await page.hover(hoverSelectorIndex);
    }
  }

  if (focusSelector) {
    for (const focusSelectorIndex of [].concat(focusSelector)) {
      await page.waitFor(focusSelectorIndex);
      await page.focus(focusSelectorIndex);
    }
  }

  if (clickSelector) {
    for (const clickSelectorIndex of [].concat(clickSelector)) {
      await page.waitFor(clickSelectorIndex);
      await page.click(clickSelectorIndex);
    }
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
