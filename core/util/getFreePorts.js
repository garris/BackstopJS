const portfinder = require('portfinder');
/**
 * Gets the free ports.
 *
 * @param      {number}  startingPort    The starting port
 * @param      {number}  requestedPorts  how many ports should we find?
 * @return     {Array}   The free ports.
 */
module.exports = function getFreePorts (startingPort, requestedPorts) {
  return new Promise((resolve, reject) => {
    const R = resolve;
    console.log(`searching for ${requestedPorts} available ports.`);
    const requestedAmount = requestedPorts;
    const freePorts = [];

    function findFreePorts (startPort, pointer) {
      const PTR = pointer || 1;
      // console.log('freePorts > ', PTR, JSON.stringify(freePorts));
      if (PTR > requestedAmount) {
        R(freePorts);
        return;
      }
      portfinder.basePort = startPort;
      portfinder.getPort(function (err, port) {
        if (err) {
          reject(new Error(err));
        }
        freePorts[PTR - 1] = port;
        return findFreePorts(port + 1, PTR + 1);
      });
    }
    findFreePorts(startingPort);
  });
};
