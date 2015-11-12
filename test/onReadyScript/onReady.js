module.exports = function(casper, scenario, vp) {
  casper.echo('Opening nav menu');

  //casper.mouse.move('.navbar-toggle');
  //casper.click('.navbar-toggle');

  // PhantomJS fails to load the referenced jquery so using a more crude method to change the DOM
  casper.evaluate(function(){
    var navbar = document.getElementById('bs-navbar');
    navbar.className += ' in';
  });

  if (vp.name === 'phone') {
    console.log('on the phone breakpoint');
  }

  if (vp.name === 'tablet_h') {
    console.log('on the tablet_h breakpoint');
  }
  
  casper.wait(1000);
};