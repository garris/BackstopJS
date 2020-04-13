module.exports = {
  execute: function (config) {
    return new Promise((resolve, reject) => {
      resolve(0);
      setTimeout(function () {
        console.log('Stopping backstop remote.');
        process.exit(0);
      }, 0);
    });
  }
};
