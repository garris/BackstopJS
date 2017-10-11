module.exports = function (chromy, scenario, vp) {
  console.log('SCENARIO > ' + scenario.label);
  require('./clickAndHoverHelper')(chromy, scenario);

  chromy.evaluate(() => { window.location = 'https://garris.github.io/BackstopJS/?delay'; });
  chromy.wait('.moneyshot');
};
