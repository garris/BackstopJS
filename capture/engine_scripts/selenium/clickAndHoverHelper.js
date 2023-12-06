const { until, By, Actions } = require('selenium-webdriver');

module.exports = async (driver, scenario) => {
  const hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  const clickSelector = scenario.clickSelectors || scenario.clickSelector;
  const keyPressSelector = scenario.keyPressSelectors || scenario.keyPressSelector;
  const scrollToSelector = scenario.scrollToSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (keyPressSelector) {
    for (const keyPressSelectorItem of [].concat(keyPressSelector)) {
      await driver.wait(until.elementLocated(By.css(keyPressSelectorItem.selector)));
      const element = await driver.findElement(By.css(keyPressSelectorItem.selector));
      await element.sendKeys(keyPressSelectorItem.keyPress);
    }
  }

  if (hoverSelector) {
    for (const hoverSelectorIndex of [].concat(hoverSelector)) {
      await driver.wait(until.elementLocated(By.css(hoverSelectorIndex)));
      const hoverElement = await driver.findElement(By.css(hoverSelectorIndex));
      await new Actions(driver).move({ origin: hoverElement }).perform();
    }
  }

  if (clickSelector) {
    for (const clickSelectorIndex of [].concat(clickSelector)) {
      await driver.wait(until.elementLocated(By.css(clickSelectorIndex)));
      const clickElement = await driver.findElement(By.css(clickSelectorIndex));
      await clickElement.click();
    }
  }

  if (postInteractionWait) {
    await driver.sleep(postInteractionWait);
  }

  if (scrollToSelector) {
    await driver.wait(until.elementLocated(By.css(scrollToSelector)));
    await driver.executeScript(scrollToSelector => {
      document.querySelector(scrollToSelector).scrollIntoView();
    }, scrollToSelector);
  }
};
