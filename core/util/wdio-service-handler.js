const loadedServiceNames = [];
const loadedServiceInstances = [];
module.exports.setService = async (serviceName, serivce, config) => {
  if (loadedServiceNames.indexOf(serviceName) === -1) {
    console.info('Run onPrepare hook for ' + serviceName);

    loadedServiceNames.push(serviceName);
    await serivce.onPrepare({ ...config.capabilities });
    loadedServiceInstances.push(serivce);
  }
  await new Promise((resolve, reject) => {
    const serviceIndex = loadedServiceNames.indexOf(serviceName);
    const waiter = setInterval(() => {
      if (loadedServiceInstances[serviceIndex] !== undefined) {
        resolve();
        clearInterval(waiter);
      }
    }, 50);
  });
};
module.exports.isLoadedService = (serviceName) => {
  return (loadedServiceNames.indexOf(serviceName) === -1);
};

module.exports.tearDownService = async (serviceName) => {
  const serviceIndex = loadedServiceNames.indexOf(serviceName);
  await loadedServiceInstances[serviceIndex].onComplete();
};
