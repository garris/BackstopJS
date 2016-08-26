module.exports = function (casper, scenario, vp) {
  console.log('Your web-app has not loaded yet. Edit onBefore.js to log-in, load cookies or set other states required for your test.', 'INFO');
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
