module.exports = async (driver, scenario, vp) => {
  console.log('SCENARIO > ' + scenario.label);
  await require('./clickAndHoverHelper')(driver, scenario);

  // add more ready handlers here...
};
