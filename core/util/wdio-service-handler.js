const loadedServiceNames = [];
const loadedServiceInstances = [];
const setService = async (serviceName, serivce, config, capabilities) => {
  if (loadedServiceNames.indexOf(serviceName) === -1) {
    console.info('Run onPrepare hook for ' + serviceName);
    loadedServiceNames.push(serviceName);
    await serivce.onPrepare(config, capabilities);
    loadedServiceInstances.push(serivce);
  }
  // here we can add service restarts
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
const isLoadedService = (serviceName) => {
  return (loadedServiceNames.indexOf(serviceName) === -1);
};

const tearDownService = async (serviceName) => {
  const serviceIndex = loadedServiceNames.indexOf(serviceName);
  await loadedServiceInstances[serviceIndex].onComplete();
};

const tearDownServices = async () => {
  for (let i = 0; i < loadedServiceNames.length; i++) {
    await tearDownService(loadedServiceNames[i]);
  }
};
module.exports = {
  tearDownServices,
  setService
};
