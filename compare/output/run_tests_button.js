document.body.onload = addTestButton();

function addTestButton() {
  const testButton = document.createElement('button');
  const buttonText = document.createTextNode('Test');
  const settingsHeader = document.querySelector('section.header > div > section > div:nth-of-type(3)');
  testButton.id = 'dg--test-button';
  testButton.classList.add('darkreader');
  testButton.appendChild(buttonText);
  testButton.addEventListener("click", async function() {
    testButton.disabled = true;
    testButton.classList.toggle("running", true);
    try {
      const response = await fetch('http://localhost:3000/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (!response.ok) {
        alert("The remote server doesn't appear to be running.");
        throw new Error("BackstopJS Remote Server Not Running");
      } else {
        testButton.disabled = false;
        testButton.classList.toggle("running", false);
        location.reload();
      }
    } catch (error) {
      console.error("There was a problem requesting a test run from Backstop Remote.", error);
    }
  });

  settingsHeader.prepend(testButton);
}