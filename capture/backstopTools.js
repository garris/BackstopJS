'use strict';
module.exports = (chromy) => {
  return chromy.evaluate(() => {
    var BODY_SELECTOR = 'body';
    var DOCUMENT_SELECTOR = 'document';
    var VIEWPORT_SELECTOR = 'viewport';
    var INJECT_CSS = 'html {-webkit-font-smoothing: antialiased;}';

    function injectStyle(cssString) {
      var styleTag = document.createElement('style');
      styleTag.innerHTML = cssString;
      document.body.appendChild(styleTag);
    }

    injectStyle(INJECT_CSS);

    /**
     * Take an array of selector names and return and array of *all* matching selectors.
     * For each selector name, If more than 1 selector is matched, proceeding matches are
     * tagged with an additional `__n` class.
     *
     * @param  {[string]} collapsed list of selectors
     * @return {[string]} [array of expanded selectors]
     */
    window.expandSelectors = function (selectors) {
      if (!Array.isArray(selectors)) {
        selectors = selectors.split(',');
      }
      return selectors.reduce(function (acc, selector) {
        if (selector === BODY_SELECTOR || selector === VIEWPORT_SELECTOR) {
          return acc.concat([selector]);
        }
        if (selector === DOCUMENT_SELECTOR) {
          return acc.concat([DOCUMENT_SELECTOR]);
        }
        var qResult = document.querySelectorAll(selector);

        // pass-through any selectors that don't match any DOM elements
        if (!qResult.length) {
          return acc.concat(selector);
        }

        var expandedSelector = [].slice.call(qResult)
          .map(function (element, expandedIndex) {
            if (element.classList.contains('__86d')) {
              return '';
            }
            if (!expandedIndex) {
              // only first element is used for screenshots -- even if multiple instances exist.
              // therefore index 0 does not need extended qualification.
              return selector;
            }
            // create index partial
            var indexPartial = '__n' + expandedIndex;
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
      if (selector === BODY_SELECTOR || selector === DOCUMENT_SELECTOR || selector === VIEWPORT_SELECTOR) {
        return true;
      } else if (window.exists(selector)) {
        const element = document.querySelector(selector);
        const style = window.getComputedStyle(element);
        return (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0');
      }
      return false;
    };

    window.exists = function (selector) {
      if (selector === BODY_SELECTOR || selector === DOCUMENT_SELECTOR || selector === VIEWPORT_SELECTOR) {
        return 1;
      }
      return document.querySelectorAll(selector).length;
    };

    window.hasLogged = function (str) {
      return new RegExp(str).test(window._consoleLogger);
    };

    window.startConsoleLogger = function () {
      if (typeof window._consoleLogger !== 'string') {
        window._consoleLogger = '';
      }
      var log = window.console.log.bind(console);
      window.console.log = function () {
        window._consoleLogger += Array.from(arguments).join('\n');
        log.apply(this, arguments);
      };
    };

    startConsoleLogger();
    console.info('backstopTools are running');
  });
};
