const ENGINE = 'puppet';
const SCRIPT_PATH = 'puppet';
const URL = 'https://garris.github.io/BackstopJS/index.html';

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
      url: `${URL}`
    },
    {
      label: 'pkra bug test',
      url: `${URL}`,
      selectors: ['#pkratest', '.logoBlock']
    },
    {
      label: 'delay',
      url: `${URL}?delay`,
      delay: 5000,
      selectors: ['.moneyshot']
    },
    {
      label: 'readyEvent',
      url: `${URL}?delay`,
      readyEvent: '_the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'readySelector',
      url: `${URL}?delay`,
      readySelector: '._the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'noDelay',
      url: `${URL}?delay`,
      selectors: ['.moneyshot']
    },
    {
      label: 'expanded',
      url: `${URL}`,
      selectors: ['p'],
      selectorExpansion: true
    },
    {
      label: 'notExpanded',
      url: `${URL}`,
      selectors: ['p'],
      delay: 1000
    },
    {
      label: 'expect',
      url: `${URL}`,
      selectors: ['p'],
      selectorExpansion: true,
      expect: 7
    },
    {
      label: 'magicSelectors',
      url: `${URL}`,
      selectors: ['document', 'viewport']
    },
    {
      label: 'hideSelectors',
      url: `${URL}`,
      hideSelectors: ['.logo-link', 'p']
    },
    {
      label: 'removeSelectors',
      url: `${URL}`,
      removeSelectors: ['.logo-link', 'p']
    },
    {
      label: 'notFound',
      url: `${URL}`,
      selectors: ['.monkey']
    },
    {
      label: 'notVisible',
      url: `${URL}`,
      selectors: ['#noShow']
    },
    {
      label: 'cookies',
      cookiePath: 'backstop_data/cookies.json',
      url: 'https://garris.github.io/BackstopJS/?cookie',
      selectors: ['.moneyshot']
    },
    // {
    //   label: 'customReadyScript',
    //   onReadyScript: `${SCRIPT_PATH}/overrideCSS.js`,
    //   url: `${URL}`,
    //   selectors: ['.moneyshot']
    // },
    // {
    //   label: 'redirect',
    //   url: `${URL}`,
    //   onReadyScript: `${SCRIPT_PATH}/redirect.js`,
    //   selectors: ['.moneyshot']
    // },
    {
      label: 'hover',
      url: `${URL}?click`,
      hoverSelector: '#theLemur',
      postInteractionWait: 1000,
      selectors: ['.moneyshot']
    },
    {
      label: 'click',
      url: `${URL}?click`,
      clickSelector: '#theLemur',
      postInteractionWait: '._the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'scrollToSelector',
      url: './special_cases/scrollToSelector.html',
      scrollToSelector: '.lemurFace',
      selectors: ['.lemurFace']
    },
    {
      label: 'misMatchThreshold_requireSameDimensions',
      url: 'https://garris.github.io/BackstopJS/',
      referenceUrl: 'https://garris.github.io/BackstopJS/?cookie',
      selectors: ['.moneyshot'],
      misMatchThreshold: 6.0,
      requireSameDimensions: false
    },
    {
      label: 'misMatchThreshold_realNumberDifference',
      url: 'https://garris.github.io/BackstopJS/',
      referenceUrl: 'https://garris.github.io/BackstopJS/?cookie',
      selectors: ['.moneyshot'],
      misMatchThreshold: 0.01,
      requireSameDimensions: true
    },
    {
      label: 'scenarioSpecificViewports',
      url: `${URL}`,
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
      url: `${URL}`,
      viewports: []
    },
    {
      label: 'scenarioSpecificViewports-withMultipleViewports',
      url: `${URL}`,
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
      url: `${URL}`,
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
    },
    {
      label: 'keyPressSelector',
      url: '../../examples/featureTests/index.html',
      keyPressSelectors: [
        {
          selector: 'input[placeholder="Email"]',
          keyPress: 'marcdacz@backstopjs.com'
        },
        {
          selector: 'input[placeholder="Password"]',
          keyPress: '1234'
        }
      ],
      selectors: ['div[id=navbar]'],
      viewports: [
        {
          label: 'Desktop',
          width: 800,
          height: 300
        }
      ]
    }
  ],
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    engine_scripts: 'backstop_data/engine_scripts',
    html_report: 'backstop_data/html_report',
    ci_report: 'backstop_data/ci_report'
  },
  report: ['browser', 'json'],
  engine: ENGINE,
  engineOptions: {
    args: ['--no-sandbox']
  },
  asyncCaptureLimit: 10,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false
};
