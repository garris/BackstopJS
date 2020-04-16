module.exports = async (page, scenario) => {
  const hoverSelector = scenario.hoverSelector;
  const clickSelector = scenario.clickSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

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
};
