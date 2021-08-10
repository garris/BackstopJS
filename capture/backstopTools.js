'use strict';
module.exports = (target) => {
  return target.evaluate(() => {
    if (window._backstopTools) {
      return false;
    }

    window._backstopTools = {
      hasLogged: function (str) {
        return new RegExp(str).test(window._backstopTools._consoleLogger);
      },
      startConsoleLogger: function () {
        if (typeof window._backstopTools._consoleLogger !== 'string') {
          window._backstopTools._consoleLogger = '';
        }
        const log = window.console.log.bind(console);
        window.console.log = function () {
          window._backstopTools._consoleLogger += Array.from(arguments).join('\n');
          log.apply(this, arguments);
        };
      },
      /**
       * Take an array of selector names and return and array of *all* matching selectors.
       * For each selector name, If more than 1 selector is matched, proceeding matches are
       * tagged with an additional `__n` class.
       *
       * @return {[string]} [array of expanded selectors]
       * @param selectors
       */
      expandSelectors: function (selectors) {
        if (!Array.isArray(selectors)) {
          selectors = selectors.split(',');
        }
        return selectors.reduce(function (acc, selector) {
          if (selector === 'body' || selector === 'viewport') {
            return acc.concat([selector]);
          }
          if (selector === 'document') {
            return acc.concat(['document']);
          }
          const qResult = document.querySelectorAll(selector);

          // pass-through any selectors that don't match any DOM elements
          if (!qResult.length) {
            return acc.concat(selector);
          }

          const expandedSelector = [].slice.call(qResult)
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
              const indexPartial = '__n' + expandedIndex;
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
      },
      /**
       * is the selector element visible?
       * @param  {[type]}  selector [a css selector str]
       * @return {Boolean}          [is it visible? true or false]
       */
      isVisible: function (selector) {
        if (selector === 'body' || selector === 'document' || selector === 'viewport') {
          return true;
        } else if (window._backstopTools.exists(selector)) {
          const element = document.querySelector(selector);
          const style = window.getComputedStyle(element);
          return (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0');
        }
        return false;
      },
      /**
       * does the selector element exist?
       * @param  {[type]} selector [a css selector str]
       * @return {[type]}          [returns count of found matches -- 0 for no matches]
       */
      exists: function (selector) {
        if (selector === 'body' || selector === 'document' || selector === 'viewport') {
          return 1;
        }
        return document.querySelectorAll(selector).length;
      }
    };

    window._backstopTools.startConsoleLogger();
    console.info('BackstopTools have been installed.');
    return true;
  });
};
