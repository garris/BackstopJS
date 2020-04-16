const styleStr = 'html { background: hotpink; }';

module.exports = function (chromy, scenario, vp) {
  console.log('SCENARIO > ' + scenario.label);
  require('./clickAndHoverHelper')(chromy, scenario);

  // inject some css to override styles
  chromy.evaluate(`window._styleData = '${styleStr}'`);
  chromy.evaluate(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    const styleNode = document.createTextNode(window._styleData);
    style.appendChild(styleNode);
    document.head.appendChild(style);
  });

  console.log('custom onReady script has run for: ', scenario.label, vp.label);
};
