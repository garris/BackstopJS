const fs = require('fs');
const path = require('path');

const onLifeCycleScript = lifecycle => async (
  page,
  scenario,
  viewport,
  isReference,
  browser,
  config
) => {
  const onScript = scenario[lifecycle] || config[lifecycle];
  if (!onScript) {
    return null;
  }

  if (typeof onScript === 'function') {
    await onScript(page, scenario, viewport, isReference, browser, config);
  } else if (typeof onScript === 'string') {
    const engineScriptsPath =
      config.env.engine_scripts || config.env.engine_scripts_default;
    const scriptPath = path.resolve(engineScriptsPath, onScript);

    if (fs.existsSync(scriptPath)) {
      await require(scriptPath)(
        page,
        scenario,
        viewport,
        isReference,
        browser,
        config
      );
    } else {
      console.warn(`WARNING: script not found: ${scriptPath}`);
    }
  }
};

module.exports.onBeforeScript = onLifeCycleScript('onBeforeScript');
module.exports.onReadyScript = onLifeCycleScript('onReadyScript');
