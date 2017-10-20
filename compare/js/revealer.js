/* global define */
(function (root, factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    // AMD support
    define(['angular'], factory);
  } else if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    // commonJS support
    module.exports = factory(require('angular'));
  } else {
    // no module loading system
    return factory(root.angular);
  }
})(this, function (angular) {
  'use strict';

  var module = 'revealer';

  /**
   * ngDoc module
   * @name 'revealer'
   * @description allow two images to be layered on top of each other
   *              and compared using a drag handler
   */
  angular
  .module(module, [])
  .directive('revealer', revealer);

  var multipleEvents = [{
    action: 'mousedown',
    move: 'mousemove',
    release: 'mouseup'
  }, {
    action: 'touchstart',
    move: 'touchmove',
    release: 'touchend'
  }];

  revealer.$inject = ['$document', '$window'];

  /**
   * @ngdoc directive
   * @name revealer.directive:revealer
   * @description directive that will take two images and create a handler *              that allows for the top image to be adjusted that reveals
   *              the image below. Images will be inherit the size of its
   *              parent container
   * @element <revealer top-image="top.png" top-label="Top Image" bottom-image="bottom.png" bottom-label="Bottom Label"></revealer>
   * @scope
   */
  function revealer ($document, $window) {
    return {
      restrcit: 'E',
      template: ['<div class="revealer__container">',
                  '<img class="revealer__image" ng-src="{{bottomImage}}">',
                  '<span class="revealer__label revealer__label--right">{{ bottomLabel}}</span>',
                  '<div class="revealer__top-image">',
                    '<img class="revealer__image" ng-src="{{topImage}}">',
                    '<span class="revealer__label revealer__label--left">{{topLabel}}</span>',
                  '</div>',
                  '<span class="revealer__handle"></span>',
                '</div>'].join(''),
      scope: {
        bottomLabel: '@',
        topLabel: '@',
        bottomImage: '@',
        topImage: '@',
        startPosition: '=?',
        onComplete: '&',
        scroll: '=?',
        scrollOffset: '=?'
      },
      link: link
    };

    function link (scope, elem, attr) {
      // throw error when image path not provided
      if ((!scope.topImage) ||
          (!scope.bottomImage)) {
        throw Error('please provide a valid path for the top and bottom image attributes on the revealer directive');
      }

      scope.startPosition = (scope.startPosition && scope.startPosition < 100) ? scope.startPosition : 50;

      scope.scroll = scope.scroll === true;
      scope.scrollOffset = scope.scrollOffset || 0;

      var handle;
      var topImage;
      var revealer;
      var handleClass;
      var revealerSettings;
      var handlerSettings;
      var handleOffset = 0;

      var handleDrag = throttle(_handleDrag, 40);
      var handleScroll = throttle(_handleScroll, 20);

      $document.ready(function () {
        // store the needed elements
        handle = getElem(elem, '.revealer__handle');
        topImage = getElem(elem, '.revealer__top-image');
        revealer = getElem(elem, '.revealer__container');
        handleClass = 'revealer__handle--drag';

        if (scope.scroll) {
          // $window does not have on method so it must be wrapped
          // in an angular.element to use this method
          angular.element($window).on('scroll', handleScroll);
        }

        (!scope.scroll) ? setRevealPosition(handle, topImage, scope.startPosition) : setRevealPosition(handle, topImage, 0);

        angular.forEach(multipleEvents, function (eventConfig) {
          handle.on(eventConfig.action, function (e) {
            var clickPos;

            handle.addClass(handleClass);
            revealerSettings = getDimensions(revealer);
            handlerSettings = getDimensions(handle);

            // get the click/touch postiton of the handler
            clickPos = mousePos(e, handlerSettings).x;

            // if the click position is on the other side of the handler
            // we have to set a negative offset, also do some maths to
            // calculate the actual value to offset
            if (clickPos > handlerSettings.width / 2) {
              handleOffset = -(clickPos - handlerSettings.width / 2);
            } else {
              handleOffset = (handlerSettings.width / 2 - clickPos);
            }

            // when the handle is dragged, can either
            // be a 'mousemove' or 'touchmove' event,
            // calculate the position of the overlay
            $document.on(eventConfig.move, handleDrag);

            // when the release action is triggered unbind
            // event listeners on drag an elements
            $document.on(eventConfig.release, removeListeners);
          });
        });

        scope.$watch('startPosition', function (newValue, oldValue) {
          setRevealPosition(handle, topImage, newValue);
        });
      }); // ready

      /**
       * handle the drag of the handle, if the handle is
       * dragged outside the container do nothing. Otherwise
       * calculate the percentage and set the position of
       * the handle and the width of the topImage container
       * @param  {Event Object} e : Event Object
       */
      function _handleDrag (e) {
        e.preventDefault();

        var eventObject = (e.type === 'mousemove') ? e : e.changedTouches[0];
        var position = mousePos(eventObject, revealerSettings);
        var percentage;

        position.x += handleOffset;

        if (position.x < 0 || position.x > revealerSettings.width) {
          return;
        }

        percentage = (position.x / revealerSettings.width) * 100;

        setRevealPosition(handle, topImage, percentage);
      }

      /**
       * when the pages scrolls calculate if the element is in the
       * viewport and then set the reveal position in relation to
       * the scroll position of the element
       * @param  {Event Object} e
       */
      function _handleScroll (e) {
        e.preventDefault();

        // calculate if elem in viewport
        // if it is, calculate the scroll percentage
        // in relation to the elem, set percentage for revealer
        if (inView(elem, $window, scope.scrollOffset)) {
          var elemTop = getDimensions(elem[0].parentNode).top;
          var height = window.innerHeight - scope.scrollOffset;
          var percentage = (height - elemTop) / height * 100;

          if (percentage > 0 && percentage < 100) {
            setRevealPosition(handle, topImage, percentage);
          }
        }
      }

      /**
       * ensure only the correct event listener functions
       * are removed from the 'document' object
       * @param  {Object} config
       * @param  {Event object} e
       */
      function removeListeners (e) {
        var configIndex = (e.type === multipleEvents[0].release) ? 0 : 1;
        var config = multipleEvents[configIndex];

        if (scope.onComplete) {
          scope.onComplete();
        }

        handle.removeClass(handleClass);
        $document.off(config.move, handleDrag);
        $document.off(config.release, removeListeners);

        if (scope.pageScroll) {
          angular.element($window).off('scroll', handleScroll);
        }
      }
    } // link
  } // revealer

  /**
   * set the position of the handler and the revealer
   * @param {DOM Object} handle   : drag handler
   * @param {DOM object} revealer : top image to reveal
   * @param {Number} position     : position of revealer
   */
  function setRevealPosition (handle, revealer, position) {
    handle.css({ left: appendPercentage(position) });
    revealer.css({ width: appendPercentage(position) });
  }

  /**
   * return an angular element based on the querySelector of the elem provided
   * @param  {DOM Element} elem : element to find elements near
   * @param  {String} value     : class to search for
   * @return {DOM Element}
   */
  function getElem (elem, value) {
    return angular.element(elem[0].querySelector(value));
  }

  /**
   * get the mouse coordinates based on a target element
   * @param  {Event object}  e
   * @param  {Object} target position of target element on page
   * @return {Object}        x and y coordinates of mouse
   */
  function mousePos (e, target) {
    return {
      x: e.clientX - target.left
    };
  }

  /**
   * get the settings of the DOM element passed as a parameter
   * @param  {DOM element} elem
   * @return {Object}      getBoundingClientRect() results
   */
  function getDimensions (elem) {
    elem = elem[0] || elem;
    return elem.getBoundingClientRect();
  }

  /**
   * return the value as a string with '%' appendPercentage
   * @param  {Number} value
   * @return {String} string representation of value
   */
  function appendPercentage (value) {
    return value + '%';
  }

  /**
   * utility function to throttle the execution
   * of the callback, this is useful when every
   * operations need to be done on events that
   * get executed in rapid succession. The callback
   * will get executed after the delay
   * @param  {Function} cb
   * @param  {Number}   delay
   * @return {Function}
   */
  function throttle (cb, delay) {
    var _this = this;
    var wait = false;

    function reset () {
      wait = false;
    }

    return function () {
      if (!wait) {
        cb.apply(_this, arguments);
        wait = true;
        setTimeout(reset, delay);
      }
    };
  }

  /**
   * return if the DOM element is within the window
   * viewport, offset can be applied
   * @param  {DOM Object}   elem
   * @param  {Object}       global
   * @param  {Number}       offset
   * @return {Boolean}
   */
  function inView (elem, win, offset) {
    offset = offset || 0;
    var dimensions = getDimensions(elem[0].parentNode || elem);
    return (!!dimensions && dimensions.bottom >= 0 && dimensions.top <= win.innerHeight - offset);
  }

  return module;
});
