module.exports = async (page, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label);
  await require('./clickAndHoverHelper')(page, scenario);
  await require('./overrideCSS')(page, scenario);

  // add more ready handlers here...
};
