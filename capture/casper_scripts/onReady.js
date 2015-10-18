module.exports = function(casper, scenario) {
  casper.echo('Opening nav menu');

  //casper.mouse.move('.navbar-toggle');
  //casper.click('.navbar-toggle');

  casper.evaluate(function(){
    var navbar = document.getElementById('bs-navbar');
    navbar.className += ' in';
  });

  casper.wait(1000);
};
