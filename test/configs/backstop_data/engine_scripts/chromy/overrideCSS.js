const styleStr = 'html { background: hotpink; }';

module.exports = function (chromy, scenario, vp) {
  console.log('SCENARIO > ' + scenario.label);
  require('./clickAndHoverHelper')(chromy, scenario);

  // inject some css to override styles
  chromy.evaluate(`window._styleData = '${styleStr}'`);
  chromy.evaluate(() => {
    var style = document.createElement('style');
    style.type = 'text/css';
    var styleNode = document.createTextNode(window._styleData);
    style.appendChild(styleNode);
    document.head.appendChild(style);
  });

  console.log('custom onReady script has run for: ', scenario.label, vp.label);
};
