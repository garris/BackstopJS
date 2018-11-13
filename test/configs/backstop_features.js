const ENGINE = 'puppet';
const SCRIPT_PATH = 'puppet';

module.exports = {
  id: `${ENGINE}_backstop_features`,
  viewports: [
    {
      label: 'phone',
      width: 320,
      height: 480
    },
    {
      label: 'tablet',
      width: 1024,
      height: 768
    }
  ],
  onBeforeScript: `${SCRIPT_PATH}/onBefore.js`,
  onReadyScript: `${SCRIPT_PATH}/onReady.js`,
  scenarios: [
    {
      label: 'Simple',
      url: 'http://host.docker.internal:8080/index.html'
    },
    {
      label: 'pkra bug test',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['#pkratest', '.logoBlock']
    },
    {
      label: 'delay',
      url: 'http://host.docker.internal:8080/index.html?delay',
      delay: 5000,
      selectors: ['.moneyshot']
    },
    {
      label: 'readyEvent',
      url: 'http://host.docker.internal:8080/index.html?delay',
      readyEvent: '_the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'readySelector',
      url: 'http://host.docker.internal:8080/index.html?delay',
      readySelector: '._the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'noDelay',
      url: 'http://host.docker.internal:8080/index.html?delay',
      selectors: ['.moneyshot']
    },
    {
      label: 'expanded',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['p'],
      selectorExpansion: true
    },
    {
      label: 'notExpanded',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['p'],
      delay: 1000
    },
    {
      label: 'expect',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['p'],
      selectorExpansion: true,
      expect: 7
    },
    {
      label: 'magicSelectors',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['document', 'viewport']
    },
    {
      label: 'hideSelectors',
      url: 'http://host.docker.internal:8080/index.html',
      hideSelectors: ['.logo-link', 'p']
    },
    {
      label: 'removeSelectors',
      url: 'http://host.docker.internal:8080/index.html',
      removeSelectors: ['.logo-link', 'p']
    },
    {
      label: 'notFound',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['.monkey']
    },
    {
      label: 'notVisible',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['#noShow']
    },
    {
      label: 'cookies',
      cookiePath: 'backstop_data/cookies.json',
      url: 'https://garris.github.io/BackstopJS/?cookie',
      selectors: ['.moneyshot']
    },
    {
      label: 'hover',
      url: 'http://host.docker.internal:8080/index.html?click',
      hoverSelector: '#theLemur',
      postInteractionWait: 1000,
      selectors: ['.moneyshot']
    },
    {
      label: 'click',
      url: 'http://host.docker.internal:8080/index.html?click',
      clickSelector: '#theLemur',
      postInteractionWait: '._the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'scrollToSelector',
      url: 'http://host.docker.internal:8080/scrollToSelector.html',
      scrollToSelector: '.lemurFace',
      selectors: ['.lemurFace']
    },
    {
      label: 'misMatchThreshold_requireSameDimensions',
      url: 'https://garris.github.io/BackstopJS/',
      referenceUrl: 'https://garris.github.io/BackstopJS/?cookie',
      selectors: ['.moneyshot'],
      misMatchThreshold: 5.0,
      requireSameDimensions: false
    },
    {
      label: 'scenarioSpecificViewports',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['document', 'viewport'],
      viewports: [
        {
          label: 'Galaxy-S5',
          width: 360,
          height: 640
        }
      ]
    },
    {
      label: 'scenarioSpecificViewports-withEmptyViewports',
      url: 'http://host.docker.internal:8080/index.html',
      viewports: []
    },
    {
      label: 'scenarioSpecificViewports-withMultipleViewports',
      url: 'http://host.docker.internal:8080/index.html',
      viewports: [
        {
          label: 'Pixel-2',
          width: 411,
          height: 731
        },
        {
          label: 'Pixel2-XL',
          width: 411,
          height: 823
        },
        {
          label: 'iPhone-X',
          width: 375,
          height: 812
        },
        {
          label: 'iPad-Pro',
          width: 1024,
          height: 1366
        }
      ]
    },
    {
      label: 'scenarioSpecificViewports-withExpandSelector',
      url: 'http://host.docker.internal:8080/index.html',
      selectors: ['p'],
      selectorExpansion: true,
      viewports: [
        {
          label: 'Pixel-2',
          width: 411,
          height: 731
        },
        {
          label: 'Pixel2-XL',
          width: 411,
          height: 823
        },
        {
          label: 'iPhone-X',
          width: 375,
          height: 812
        },
        {
          label: 'iPad-Pro',
          width: 1024,
          height: 1366
        }
      ]
    }
  ],
  paths: {
    bitmaps_reference: 'test/configs/backstop_data/bitmaps_reference',
    bitmaps_test: 'test/configs/backstop_data/bitmaps_test',
    engine_scripts: 'test/configs/backstop_data/engine_scripts',
    html_report: 'test/configs/backstop_data/html_report',
    ci_report: 'test/configs/backstop_data/ci_report'
  },
  report: ['browser'],
  engine: ENGINE,
  engineOptions: {
    args: ['--no-sandbox']
  },
  asyncCaptureLimit: 10,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
};
