const filterStorageKey = 'backstopFilterValue';
const settingsHeader = document.querySelector('section.header > div > section > div:nth-of-type(3)');
const filterInput = document.getElementById('dg--filter-input');

const setFilter = () => {
  const filterValue = getFilterStorage();
  const ev = new Event('input', { bubbles: true });
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  ev.simulated = true;
  if (filterValue) {
    nativeInputValueSetter.call(filterInput, filterValue);
    filterInput.dispatchEvent(ev);
    filterInput.focus();
  }
};

const getFilter = () => {
  const inputValue = filterInput.value;
  return inputValue;
};

const setFilterStorage = (value) => {
  window.localStorage.setItem(filterStorageKey, value);
};

const getFilterStorage = () => {
  const filterValue = window.localStorage.getItem(filterStorageKey);
  return filterValue || false;
};

function addTestButton () {
  const testButton = document.createElement('button');
  const buttonText = document.createTextNode('Test');
  testButton.id = 'dg--test-button';
  testButton.classList.add('darkreader');
  testButton.classList.add('dg--button');
  testButton.appendChild(buttonText);
  testButton.addEventListener('click', async function () {
    const filter = getFilter();
    const URL = `http://localhost:3000/test${filter && '?filter=' + filter}`;
    setFilterStorage(filter);
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
      testButton.classList.toggle('running', false);
      window.alert("Backstop remote isn't running");
      console.error('There was a problem requesting a test run from Backstop Remote.', error);
    }
  });

  settingsHeader.prepend(testButton);
}

function addRefButton () {
  const refButton = document.createElement('button');
  const buttonText = document.createTextNode('Reference');
  refButton.id = 'dg--ref-button';
  refButton.classList.add('darkreader');
  refButton.classList.add('dg--button');
  refButton.appendChild(buttonText);
  refButton.addEventListener('click', async function () {
    const filter = getFilter();
    setFilterStorage(filter);
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
      refButton.disabled = true;
      refButton.classList.toggle('running', false);
      window.alert("Backstop remote isn't running");
      console.error('There was a problem requesting a reference run from Backstop Remote.', error);
    }
  });

  settingsHeader.prepend(refButton);
}

async function pingUrl (url) {
  try {
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      referrerPolicy: 'no-referrer'
    }).then(() => {
      addTestButton();
      addRefButton();
    });
  } catch (err) {
    console.log("%c The Backstop remote server isn't running! ", 'background: #222; color: #bada55');
    console.log(err);
  }
  return 'error';
}

document.body.onload = setFilter();
document.body.onload = pingUrl('http://localhost:3000');
