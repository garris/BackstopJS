module.exports = async (browser, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label);
  await require('./clickAndHoverHelper')(browser, scenario);

  // add more ready handlers here...
};
