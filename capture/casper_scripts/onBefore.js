module.exports = function (casper, scenario, vp) {
  // This script runs before your app loads. Edit here to log-in, load cookies or set other states required for your test.
  console.log('onBefore.js has run for ' + vp.name + '.');
};

// // EXAMPLE: LOGIN BEFORE RUNNING TESTS
// module.exports = function(casper, scenario, vp) {
//   casper.thenOpen(scenario.url, function(){
//      if (this.exists('form#user-login-form')) {
//        this.fill('form#loginForm',{
//           'username': 'test',
//           'password': 'changeme'
//        }, true);
//      }
//   });
// };
