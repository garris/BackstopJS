/**
 * Gets the custom remote port, otherwise return the default (3000).
 *
 * @return     {number}   The remote port.
 */
module.exports = function getRemotePort () {
  const remotePort = process.env.BACKSTOP_REMOTE_HTTP_PORT || 3000;
  return remotePort;
};
