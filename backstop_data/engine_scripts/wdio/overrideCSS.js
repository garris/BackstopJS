const BACKSTOP_TEST_CSS_OVERRIDE = `html {background-image: none;}`;

module.exports = async (browser, scenario) => {
  // inject arbitrary css to override styles
  await browser.execute(`window._styleData = '${BACKSTOP_TEST_CSS_OVERRIDE}'`);
  await browser.execute(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    const styleNode = document.createTextNode(window._styleData);
    style.appendChild(styleNode);
    document.head.appendChild(style);
  });

  console.log('BACKSTOP_TEST_CSS_OVERRIDE injected for: ' + scenario.label);
};
