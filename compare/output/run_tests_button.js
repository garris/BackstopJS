document.body.onload = addTestButton();

function addTestButton() {
  const testButton = document.createElement('button');
  const buttonText = document.createTextNode('Test');
  const settingsHeader = document.querySelector('section.header > div > section > div:nth-of-type(3)');
  testButton.id = 'dg--test-button';
  testButton.class = 'darkreader';
  testButton.appendChild(buttonText);
  testButton.addEventListener("click", function() {
    fetch('http://localhost:3000/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  });

  settingsHeader.prepend(testButton);
  setTimeout(() => {
    console.log('adding button');
  }, 500);
}