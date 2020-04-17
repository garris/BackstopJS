module.exports = async (page, scenario) => {
  const hoverSelector = scenario.hoverSelector;
  const focusSelector = scenario.focusSelector;
  const clickSelector = scenario.clickSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    await page.waitFor(hoverSelector);
    await page.hover(hoverSelector);
  }

  if (focusSelector) {
    await page.waitFor(focusSelector);
    await page.focus(focusSelector);
  }

  if (clickSelector) {
    await page.waitFor(clickSelector);
    await page.click(clickSelector);
  }

  if (postInteractionWait) {
    await page.waitFor(postInteractionWait);
  }
};
