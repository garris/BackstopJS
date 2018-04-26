module.exports = async (page, scenario) => {
  var hoverSelector = scenario.hoverSelector;
  var clickSelector = scenario.clickSelector;
  var activeSelector = scenario.activeSelector;
  var postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (hoverSelector) {
    await page.waitFor(hoverSelector);
    await page.hover(hoverSelector);
  }

  if (clickSelector) {
    await page.waitFor(clickSelector);
    await page.click(clickSelector);
  }

  // todo: test
  if (activeSelector) {
    await page.waitFor(activeSelector)
    var el = await page.$(activeSelector);
    var rect = el.getBoundingClientRect();
    await page.mouse.move(rect.left + rect.width/2, rect.top + rect.height/2)
    await page.mouse.down();
  }

  if (postInteractionWait) {
    await page.waitFor(postInteractionWait);
  }
};
