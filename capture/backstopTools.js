var BODY_SELECTOR = 'body';
var DOCUMENT_SELECTOR = 'document';
var INJECT_CSS = 'html {-webkit-font-smoothing: antialiased;}';

function injectStyle (str) {
  var styleTag = document.createElement('style');
  styleTag.innerHTML = str;
  document.body.appendChild(styleTag);
}
injectStyle(INJECT_CSS);

window.expandSelectors = function (selectors) {
  if (!Array.isArray(selectors)) {
    selectors = selectors.split(',');
  }
  return selectors.reduce(function (acc, selector) {
    if (selector === BODY_SELECTOR) {
      return acc.concat([BODY_SELECTOR]);
    }
    if (selector === DOCUMENT_SELECTOR) {
      return acc.concat([DOCUMENT_SELECTOR]);
    }
    var expandedSelector = [].slice.call(document.querySelectorAll(selector))
      .map(function (element, expandedIndex) {
        var indexPartial = '__n' + expandedIndex;
        if (element.classList.contains('__86d')) {
          return '';
        }
        if (!expandedIndex) {
          // only first element is used for screenshots -- even if multiple instances exist.
          // therefore index 0 does not need extended qualification.
          return selector;
        }
        // update all matching selectors with additional indexPartial class
        element.classList.add(indexPartial);
        // return array of fully-qualified classnames
        return selector + '.' + indexPartial;
      });
    // concat arrays of fully-qualified classnames
    return acc.concat(expandedSelector);
  }, []).filter(function (selector) {
    return selector !== '';
  });
};

window.isVisible = function (selector) {
  if (!window.exists(selector)) {
    return false;
  }
  const element = document.querySelector(selector);
  const style = window.getComputedStyle(element);
  return (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0');
};

window.exists = function (selector) {
  return document.querySelectorAll(selector).length;
};

var _consoleLogger = '';
window._hasLogged = function (str) {
  return new RegExp(str).test(_consoleLogger);
};
function startConsoleLogger () {
  var log = console.log.bind(console);
  console.log = function () {
    _consoleLogger += Array.from(arguments).join('\n');
    log.apply(this, arguments);
  };
}
startConsoleLogger();

console.info('backstopTools are running');
