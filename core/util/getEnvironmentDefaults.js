/**
 * Reads optional BACKSTOP_* environment variable overrides.
 */
module.exports = function getEnvironmentDefaults () {
  return {
    asyncCaptureLimit: parseInt(process.env.BACKSTOP_ASYNC_CAPTURE_LIMIT, 10) || undefined,
    asyncCompareLimit: parseInt(process.env.BACKSTOP_ASYNC_COMPARE_LIMIT, 10) || undefined
  };
};
