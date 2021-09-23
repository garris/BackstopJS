function getMisMatchThreshHold (scenario, config) {
  if (typeof scenario.misMatchThreshold !== 'undefined') { return scenario.misMatchThreshold; }
  if (typeof config.misMatchThreshold !== 'undefined') { return config.misMatchThreshold; }
  return config.defaultMisMatchThreshold;
}

function ensureFileSuffix (filename, suffix) {
  const re = new RegExp('\.' + suffix + '$', ''); // eslint-disable-line no-useless-escape
  return filename.replace(re, '') + '.' + suffix;
}

// merge both strings while soft-enforcing a single slash between them
function glueStringsWithSlash (stringA, stringB) {
  return stringA.replace(/\/$/, '') + '/' + stringB.replace(/^\//, '');
}

function genHash (str) {
  let hash = 0;
  let i;
  let chr;
  let len;
  if (!str) return hash;
  str = str.toString();
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  // return a string and replace a negative sign with a zero
  return hash.toString().replace(/^-/, 0);
}

function getRequireSameDimensions (scenario, config) {
  if (scenario.requireSameDimensions !== undefined) {
    return scenario.requireSameDimensions;
  } else if (config.requireSameDimensions !== undefined) {
    return config.requireSameDimensions;
  } else {
    return config.defaultRequireSameDimensions;
  }
}

function getSelectorName (selector) {
  return selector.replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number
}

function makeSafe (str) {
  return str.replace(/[ /]/g, '_');
}

function getFilename (fileNameTemplate, outputFileFormatSuffix, configId, scenarioIndex, scenarioLabelSafe, selectorIndex, selectorLabel, viewportIndex, viewportLabel) {
  let fileName = fileNameTemplate
    .replace(/\{configId\}/, configId)
    .replace(/\{scenarioIndex\}/, scenarioIndex)
    .replace(/\{scenarioLabel\}/, scenarioLabelSafe)
    .replace(/\{selectorIndex\}/, selectorIndex)
    .replace(/\{selectorLabel\}/, selectorLabel)
    .replace(/\{viewportIndex\}/, viewportIndex)
    .replace(/\{viewportLabel\}/, makeSafe(viewportLabel))
    .replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number or dash or underscore.

  const extRegExp = new RegExp(outputFileFormatSuffix + '$', 'i');
  if (!extRegExp.test(fileName)) {
    fileName = fileName + outputFileFormatSuffix;
  }
  return fileName;
}

function getEngineOption (config, optionName, fallBack) {
  if (typeof config.engineOptions === 'object' && config.engineOptions[optionName]) {
    return config.engineOptions[optionName];
  }
  return fallBack;
}

function getScenarioExpect (scenario) {
  let expect = 0;
  if (scenario.selectorExpansion && scenario.selectors && scenario.selectors.length && scenario.expect) {
    expect = scenario.expect;
  }

  return expect;
}

function generateTestPair (config, scenario, viewport, variantOrScenarioLabelSafe, scenarioLabelSafe, selectorIndex, selector) {
  const cleanedSelectorName = getSelectorName(selector);
  const fileName = getFilename(
    config._fileNameTemplate,
    config._outputFileFormatSuffix,
    config._configId,
    scenario.sIndex,
    variantOrScenarioLabelSafe,
    selectorIndex,
    cleanedSelectorName,
    viewport.vIndex,
    viewport.label
  );
  const referenceFilePath = config._bitmapsReferencePath + '/' + getFilename(
    config._fileNameTemplate,
    config._outputFileFormatSuffix,
    config._configId,
    scenario.sIndex,
    scenarioLabelSafe,
    selectorIndex,
    cleanedSelectorName,
    viewport.vIndex,
    viewport.label
  );
  const testFilePath = config._bitmapsTestPath + '/' + config.screenshotDateTime + '/' + fileName;

  return {
    reference: referenceFilePath,
    test: testFilePath,
    selector: selector,
    fileName: fileName,
    label: scenario.label,
    requireSameDimensions: getRequireSameDimensions(scenario, config),
    misMatchThreshold: getMisMatchThreshHold(scenario, config),
    url: scenario.url,
    referenceUrl: scenario.referenceUrl,
    expect: getScenarioExpect(scenario),
    viewportLabel: viewport.label
  };
}

module.exports = {
  generateTestPair: generateTestPair,
  getMisMatchThreshHold: getMisMatchThreshHold,
  getRequireSameDimensions: getRequireSameDimensions,
  ensureFileSuffix: ensureFileSuffix,
  glueStringsWithSlash: glueStringsWithSlash,
  genHash: genHash,
  makeSafe: makeSafe,
  getFilename: getFilename,
  getEngineOption: getEngineOption,
  getSelectorName: getSelectorName,
  getScenarioExpect: getScenarioExpect
};
