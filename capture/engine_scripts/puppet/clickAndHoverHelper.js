module.exports = async (page, scenario) => {
  const hoverSelector = scenario.hoverSelectors || scenario.hoverSelector;
  const clickSelector = scenario.clickSelectors || scenario.clickSelector;
  const keyPressSelector = scenario.keyPressSelectors || scenario.keyPressSelector;
  const scrollToSelector = scenario.scrollToSelector;
  const postInteractionWait = scenario.postInteractionWait; // selector [str] | ms [int]

  if (keyPressSelector) {
    for (const keyPressSelectorItem of [].concat(keyPressSelector)) {
      await page.waitForSelector(keyPressSelectorItem.selector);
      await page.type(keyPressSelectorItem.selector, keyPressSelectorItem.keyPress);
    }
  }

  if (hoverSelector) {
    for (const hoverSelectorIndex of [].concat(hoverSelector)) {
      await page.waitForSelector(hoverSelectorIndex);
      await page.hover(hoverSelectorIndex);
    }
  }

  if (clickSelector) {
    for (const clickSelectorIndex of [].concat(clickSelector)) {
      await page.waitForSelector(clickSelectorIndex);
      await page.click(clickSelectorIndex);
    }
  }

  // Force-load lazy images.
  await page.evaluate(async(scenario) => {
    let images = [];
    const lazyImages = document.querySelectorAll('[loading="lazy"]');
    lazyImages.forEach((image) => {
      images.push(image);
    });

    async function loadImages(images) {
      await images.reduce(async(promise, image) => {
        // This line will wait for the last async function to finish.
        // The first iteration uses an already resolved Promise
        // so, it will immediately continue.
        // https://stackoverflow.com/a/49499491/231914
        await promise;
        image.removeAttribute('loading');
        const result = await image.decode();
      }, Promise.resolve());
    }

    if (images.length) {
      console.log('Loading ' + images.length + ' lazy elements.');
    }
    return loadImages(images);

  }, scenario);

  
  if (postInteractionWait) {
    await new Promise(resolve => {
      setTimeout(resolve, postInteractionWait);
    });
  }

  if (scrollToSelector) {
    await page.waitForSelector(scrollToSelector);
    await page.evaluate(scrollToSelector => {
      document.querySelector(scrollToSelector).scrollIntoView();
    }, scrollToSelector);
  }
};
