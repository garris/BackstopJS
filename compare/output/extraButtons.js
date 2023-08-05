document.body.onload = addTestButton();
document.body.onload = addRefButton();

const getFilter = () => {
  const inputHeader = document.querySelector('section.header > div > section > div:nth-of-type(2)');
  const inputValue = inputHeader.querySelector('input').value;
  return inputValue;
};

function addTestButton () {
  const testButton = document.createElement('button');
  const buttonText = document.createTextNode('Test');
  const settingsHeader = document.querySelector('section.header > div > section > div:nth-of-type(3)');
  testButton.id = 'dg--test-button';
  testButton.classList.add('darkreader');
  testButton.classList.add('dg--button');
  testButton.appendChild(buttonText);
  testButton.addEventListener('click', async function () {
    const filter = getFilter();
    const URL = `http://localhost:3000/test${filter && '?filter=' + filter}`;
    try {
      testButton.disabled = true;
      testButton.classList.toggle('running', true);
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (!response.ok) {
        window.alert("The remote server doesn't appear to be running.");
        throw new Error('BackstopJS Remote Server Not Running');
      } else {
        testButton.disabled = false;
        testButton.classList.toggle('running', false);
        window.location.reload();
      }
    } catch (error) {
      console.error('There was a problem requesting a test run from Backstop Remote.', error);
    }
  });

  settingsHeader.prepend(testButton);
}

function addRefButton () {
  const refButton = document.createElement('button');
  const buttonText = document.createTextNode('Reference');
  const settingsHeader = document.querySelector('section.header > div > section > div:nth-of-type(3)');
  refButton.id = 'dg--ref-button';
  refButton.classList.add('darkreader');
  refButton.classList.add('dg--button');
  refButton.appendChild(buttonText);
  refButton.addEventListener('click', async function () {
    const filter = getFilter();
    const URL = `http://localhost:3000/ref${filter && '?filter=' + filter}`;
    try {
      refButton.disabled = true;
      refButton.classList.toggle('running', true);
      const response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (!response.ok) {
        window.alert("The remote server doesn't appear to be running.");
        throw new Error('BackstopJS Remote Server Not Running');
      } else {
        refButton.disabled = false;
        refButton.classList.toggle('running', false);
        window.location.reload();
      }
    } catch (error) {
      console.error('There was a problem requesting a reference run from Backstop Remote.', error);
    }
  });

  settingsHeader.prepend(refButton);
}
