module.exports = async (page, scenario) => {
  var hoverSelector = scenario.hoverSelector;
  var clickSelector = scenario.clickSelector;
  var postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    await page.waitFor(hoverSelector)
    await page.hover(hoverSelector);
  }

  if (clickSelector) {
    await page.waitFor(clickSelector)
    await page.click(clickSelector);
  }

  if (postInteractionWait) {
    await page.waitFor(postInteractionWait);
  }
};
