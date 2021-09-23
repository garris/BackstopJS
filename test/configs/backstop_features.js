const ENGINE = 'puppet';
const SCRIPT_PATH = 'puppet';
const URL = 'https://garris.github.io/BackstopJS';

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
      url: `${URL}/index.html`
    },
    {
      label: 'pkra bug test',
      url: `${URL}/index.html`,
      selectors: ['#pkratest', '.logoBlock']
    },
    {
      label: 'delay',
      url: `${URL}/index.html?delay`,
      delay: 5000,
      selectors: ['.getItBlock:nth-child(3)']
    },
    {
      label: 'readyEvent',
      url: `${URL}/index.html?delay`,
      readyEvent: '_the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'readyEventTimeout',
      url: `${URL}/index.html?delay`,
      readyEvent: '_the_lemur_is_ready_to_see_you_timeout',
      readyTimeout: 2000,
      selectors: ['.moneyshot']
    },
    {
      label: 'readySelector',
      url: `${URL}/index.html?delay`,
      readySelector: '._the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'readySelectorTimeout',
      url: `${URL}/index.html?delay`,
      readySelector: '._the_lemur_is_ready_to_see_you_timeout',
      readyTimeout: 2000,
      selectors: ['.moneyshot']
    },
    {
      label: 'noDelay',
      url: `${URL}/index.html?delay`,
      selectors: ['.getItBlock:nth-child(3)']
    },
    {
      label: 'expanded',
      url: `${URL}/index.html`,
      selectors: ['.getItBlock'],
      selectorExpansion: true,
      delay: 1000
    },
    {
      label: 'notExpanded',
      url: `${URL}/index.html`,
      selectors: ['.getItBlock'],
      delay: 1000
    },
    {
      label: 'expect',
      url: `${URL}/index.html`,
      selectors: ['.getItBlock'],
      selectorExpansion: true,
      expect: 4
    },
    {
      label: 'magicSelectors',
      url: `${URL}/index.html`,
      selectors: ['document', 'viewport']
    },
    {
      label: 'hideSelectors',
      url: `${URL}/index.html`,
      hideSelectors: ['.logo-link', 'p']
    },
    {
      label: 'removeSelectors',
      url: `${URL}/index.html`,
      removeSelectors: ['.logo-link', 'p']
    },
    {
      label: 'notFound',
      url: `${URL}/index.html`,
      selectors: ['.monkey']
    },
    {
      label: 'notVisible',
      url: `${URL}/index.html`,
      selectors: ['#noShow']
    },
    {
      label: 'cookies',
      cookiePath: 'backstop_data/cookies.json',
      url: `${URL}/index.html?cookie`,
      selectors: ['.moneyshot']
    },
    // {
    //   label: 'customReadyScript',
    //   onReadyScript: `${SCRIPT_PATH}/overrideCSS.js`,
    //   url: `${URL}/index.html`,
    //   selectors: ['.moneyshot']
    // },
    // {
    //   label: 'redirect',
    //   url: `${URL}/index.html`,
    //   onReadyScript: `${SCRIPT_PATH}/redirect.js`,
    //   selectors: ['.moneyshot']
    // },
    {
      label: 'hover',
      url: `${URL}/index.html?click`,
      hoverSelector: '#theLemur',
      postInteractionWait: 1000,
      selectors: ['.moneyshot']
    },
    {
      label: 'click',
      url: `${URL}/index.html?click`,
      clickSelector: '#theLemur',
      postInteractionWait: '._the_lemur_is_ready_to_see_you',
      selectors: ['.moneyshot']
    },
    {
      label: 'scrollToSelector',
      url: `${URL}/test/configs/special_cases/scrollToSelector.html`,
      scrollToSelector: '.lemurFace',
      selectors: ['.lemurFace']
    },
    // {
    //   label: 'misMatchThreshold_requireSameDimensions',
    //   url: `${URL}/index.html`,
    //   referenceUrl: 'https://garris.github.io/BackstopJS/?cookie',
    //   selectors: ['.moneyshot'],
    //   misMatchThreshold: 6.0,
    //   requireSameDimensions: false
    // },
    // {
    //   label: 'misMatchThreshold_realNumberDifference',
    //   url: `${URL}/index.html`,
    //   referenceUrl: 'https://garris.github.io/BackstopJS/?cookie',
    //   selectors: ['.moneyshot'],
    //   misMatchThreshold: 0.01,
    //   requireSameDimensions: true
    // },
    {
      label: 'scenarioSpecificViewports',
      url: `${URL}/index.html`,
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
      url: `${URL}/index.html`,
      viewports: []
    },
    {
      label: 'scenarioSpecificViewports-withMultipleViewports',
      url: `${URL}/index.html`,
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
      url: `${URL}/index.html`,
      selectors: ['.getItBlock'],
      selectorExpansion: true,
      viewports: [
        {
          label: 'iPad-Pro',
          width: 1024,
          height: 1366
        }
      ]
    },
    {
      label: 'keyPressSelector',
      url: `${URL}/examples/featureTests/index.html`,
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
      postInteractionWait: 1000,
      misMatchThreshold: 5,
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
