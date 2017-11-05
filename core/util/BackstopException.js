module.exports = class BackstopException {
  constructor (msg, scenario, viewport, originalError) {
    this.msg = msg;
    this.scenario = scenario;
    this.viewport = viewport;
    this.originalError = originalError;
  }

  toString () {
    return 'BackstopException: ' +
      this.scenario.label + ' on ' +
      this.viewport.label + ': ' +
      this.originalError.toString();
  }
};
