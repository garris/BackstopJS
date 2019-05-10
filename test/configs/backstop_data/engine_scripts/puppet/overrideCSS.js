const styleStr = 'html {font-kerning:none;}';

module.exports = function (page, scenario) {
  console.log('font-smoothing workaround for > ' + scenario.label);

  // inject some css to override styles
  page.evaluate(`window._styleData = '${styleStr}'`);
  page.evaluate(() => {
    var style = document.createElement('style');
    style.type = 'text/css';
    var styleNode = document.createTextNode(window._styleData);
    style.appendChild(styleNode);
    document.head.appendChild(style);
  });
};
