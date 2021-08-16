/**
 * Filename has historical reasons, even if that has nothing to do with inception
 * We exchange the
 * Overwrite images with imageStub
 *
 */

const fs = require('fs');
const path = require('path');

const IMAGE_URL_RE = /\.gif|\.jpg|\.png/i;
const IMAGE_STUB_URL = path.resolve(__dirname, '../../imageStub.jpg');
const IMAGE_DATA_BUFFER = fs.readFileSync(IMAGE_STUB_URL);
const HEADERS_STUB = {};

// @todo needs input
module.exports = async function (browser, scenario) {
  console.warn('Using mock Images is currently not supported with WebdriverIO,' +
    ' if you need it you can use a proxy like browsermob or use puppeteer');

  /**
   * We interate over whole dom and replace all image possibilities
   * Possible idea would be to exchange all image sources to our mock image that is hosted somewhere

   await browser.execute(() => {
    const items = window.body.getElementsByTagName('*');
    for (let i = items.length; i--;) {
      const currentElement = items[i];
      // check for css background image
      if (currentElement.style.backgroundImage !== '') {
        currentElement.style.backgroundImage = ''; // @todo add here remote url?
      }
      if (currentElement.tagName === 'img' && currentElement.src !== '') {
        // @todo remove srcset and sizes?
        currentElement.src = ''; // @todo add here remote url?
      }
      if (currentElement.tagName === 'picture' && currentElement.src !== '') {
        // @todo remove srcset and sizes?
        currentElement.src = ''; // @todo add here remote url?
      }
    }
  });
   */
};
