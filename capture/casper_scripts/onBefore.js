module.exports = function(casper, scenario, vp) {
  casper.echo('onBeforeEach.js', 'INFO');
  casper.wait(50);
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
