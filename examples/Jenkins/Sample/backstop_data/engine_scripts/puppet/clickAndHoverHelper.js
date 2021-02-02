module.exports = async (page, scenario) => {
  const hoverSelector = scenario.hoverSelector;
  const clickSelector = scenario.clickSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    await page.waitForTimeout(hoverSelector);
    await page.hover(hoverSelector);
  }

  if (clickSelector) {
    await page.waitForTimeout(clickSelector);
    await page.click(clickSelector);
  }

  if (postInteractionWait) {
    await page.waitForTimeout(postInteractionWait);
  }
};
