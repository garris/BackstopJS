module.exports = function(casper, scenario, vp) {
  casper.echo('onBeforeEach.js', 'INFO');
  casper.wait(50);
};


// // EXAMPLE: LOGIN BEFORE RUNNING TESTS
// module.exports = function(casper, scenario, vp) {
//   casper.thenOpen('http://127.0.0.1:8000/accounts/login/', function(){
//       this.fill('form#loginForm',{
//           'username': 'name',
//           'password': 'pass'
//       }, true);
//   });
// };
