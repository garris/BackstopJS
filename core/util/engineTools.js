function getMisMatchThreshHold (scenario, config) {
  if (typeof scenario.misMatchThreshold !== 'undefined') { return scenario.misMatchThreshold; }
  if (typeof config.misMatchThreshold !== 'undefined') { return config.misMatchThreshold; }
  return config.defaultMisMatchThreshold;
}

function ensureFileSuffix (filename, suffix) {
  var re = new RegExp('\.' + suffix + '$', ''); // eslint-disable-line no-useless-escape
  return filename.replace(re, '') + '.' + suffix;
}

// merge both strings while soft-enforcing a single slash between them
function glueStringsWithSlash (stringA, stringB) {
  return stringA.replace(/\/$/, '') + '/' + stringB.replace(/^\//, '');
}

function genHash (str) {
  var hash = 0;
  var i;
  var chr;
  var len;
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

function makeSafe (str) {
  return str.replace(/[ /]/g, '_');
}

function getFilename (fileNameTemplate, outputFileFormatSuffix, configId, scenarioIndex, scenarioLabelSafe, selectorIndex, selectorLabel, viewportIndex, viewportLabel) {
  var fileName = fileNameTemplate
    .replace(/\{configId\}/, configId)
    .replace(/\{scenarioIndex\}/, scenarioIndex)
    .replace(/\{scenarioLabel\}/, scenarioLabelSafe)
    .replace(/\{selectorIndex\}/, selectorIndex)
    .replace(/\{selectorLabel\}/, selectorLabel)
    .replace(/\{viewportIndex\}/, viewportIndex)
    .replace(/\{viewportLabel\}/, makeSafe(viewportLabel))
    .replace(/[^a-z0-9_-]/gi, ''); // remove anything that's not a letter or a number or dash or underscore.

  var extRegExp = new RegExp(outputFileFormatSuffix + '$', 'i');
  if (!extRegExp.test(fileName)) {
    fileName = fileName + outputFileFormatSuffix;
  }
  return fileName;
}

function getEngineOption(config, optionName, fallBack) {
  if (typeof config.engineOptions === 'object' && config.engineOptions[optionName]) {
    return config.engineOptions[optionName];
  }
  return fallBack;
}

module.exports = {
  getMisMatchThreshHold: getMisMatchThreshHold,
  ensureFileSuffix: ensureFileSuffix,
  glueStringsWithSlash: glueStringsWithSlash,
  genHash: genHash,
  makeSafe: makeSafe,
  getFilename: getFilename,
  getEngineOption: getEngineOption
}