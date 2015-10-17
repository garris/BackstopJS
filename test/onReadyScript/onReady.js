module.exports = function(casper, scenario) {
  casper.echo('Opening nav menu');

  //casper.mouse.move('.navbar-toggle');
  //casper.click('.navbar-toggle');

  // PhantomJS fails to load the referenced jquery so using a more crude method to change the DOM
  casper.evaluate(function(){
    var navbar = document.getElementById('bs-navbar');
    navbar.className += ' in';
  });

  casper.wait(1000);
};