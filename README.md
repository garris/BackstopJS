[![Build Status](https://travis-ci.org/garris/BackstopJS.svg?branch=master)](https://travis-ci.org/garris/BackstopJS)

# BackstopJS
**Catch CSS curve balls.**


BackstopJS automates visual regression testing of your responsive web UI by comparing DOM screenshots over time.

## Version 3 Features

- Render with **Chrome Headless**, **Phantom** and **Slimer**
- Simulate user interactions with **ChromyJS** and **CasperJS** scripts
- Browser reports with visual diffs
- CLI reports
- JUnit reports
- Plays nice with CI and source control
- Run globally or locally as a standalone package app or `require('backstopjs')` right into your node app
- Incredibly easy to use: just 3 commands go a long long way!


## Install BackstopJS now
```sh
$ npm install -g backstopjs
```

----

## Contents

[The BackstopJS workflow](#the-backstopjs-workflow)

[Installation](#installation)

[Getting Started](#getting-started)

[Using BackstopJS](#using-backstopjs)

[Troubleshooting](#troubleshooting)

[Tutorials, Extensions and more](#tutorials-extensions-and-more)

[Credits](#credits)

----

## The BackstopJS workflow

  - **`backstop init`:** Set up a new BackstopJS instance -- specify URLs, cookies, screen sizes, DOM selectors, interactions etc. (see examples directory)

  - **`backstop test`:** BackstopJS creates a set of *test* screenshots and compares them with your *reference* screenshots. Any changes show up in a visual report. (Run this after making CSS changes as many times as needed.)

  -  **`backstop approve`:** If the test you ran looks good, then go ahead and approve it. Approving changes will update your reference files with the results from your last test.  Future tests are compared against your most recent approved test screenshots.


## Getting started
### Installation

**[Chrome 62 or greater is required!](https://www.google.com/chrome/browser/beta.html)**

#### Global installation (recommended)
```sh
$ npm install -g backstopjs
```
#### Local installation

BackstopJS will run as a totally stand alone app -- but installing locally allows you to do this...
```js
const backstop = require('backstopjs');
```

See [Integration Options](#integration-options-local-install) to learn about cool BackstopJS integration options!


### Initializing your project

**If you don't already have BackstopJS set up...**
BackstopJS can create a default configuration file and project scaffolding in your current working directory. Please note: this will overwrite any existing files!

`cd` to your project's directory and run...

```sh
$ backstop init
```


### Working with your config file

By default, BackstopJS places `backstop.json` in the root of your project. And also by default, BackstopJS looks for this file when invoked.

#### Required config properties

As a new user setting up tests for your project, you will be primarily concerned with these properties...

**`id`** – Used for screenshot naming. Set this property when sharing reference files with teammates -- otherwise omit and BackstopJS will auto-generate one for you to avoid naming collisions with BackstopJS resources.

**`viewports`** – An array of screen size objects your DOM will be tested against.  Add as many as you like -- but add at least one.

**`scenarios`** – This is where you set up your actual tests. The important sub properties are...

- **`scenarios[n].label`** – Required. Also used for screenshot naming.
- **`scenarios[n].url`** – Required. Tells BackstopJS what endpoint/document you want to test.  This can be an absolute URL or local to your current working directory.

_TIP: no other SCENARIO properties are required. Other properties can just be added as necessary_

### Generating test bitmaps

```sh
$ backstop test
```

This will create a new set of bitmaps in `bitmaps_test/<timestamp>/`

Once the test bitmaps are generated, a report comparing the most recent test bitmaps against the current reference bitmaps will display.

Pass a `--config=<configFilePathStr>` argument to test using a different config file.

**Tip** To use a js-module as a config file, just explicitly specify your config filepath and point to a `.js` file. _Just be sure to export your config object as a node module._

Pass a `--filter=<scenarioLabelRegex>` argument to just run scenarios matching your scenario label.


### Approving changes

```sh
$ backstop approve
```

When running this command, all images (with changes) from your most recent test batch will be promoted to your reference collection. Subsequent tests will be compared against your updated reference files.

Pass a `--filter=<scenarioLabelRegex>` argument to promote only the test captures matching your scenario label.

**Tip**: Remember to pass a `--config=<configFilePathStr>` argument if you passed that when you ran your last test.



## Using BackstopJS

### Advanced Scenarios
Scenario properties are described throughout this document and **processed sequentially in the following order...**
```js
label                    // [required] Tag saved with your reference images
onBeforeScript           // Used to set up browser state e.g. cookies.
cookiePath               // import cookies in JSON format (available with default onBeforeScript see setting cookies below)
url                      // [required] The url of your app state
referenceUrl             // Specify a different state or environment when creating reference.
readyEvent               // Wait until this string has been logged to the console.
readySelector            // Wait until this selector exists before continuing.
delay                    // Wait for x milliseconds
hideSelectors            // Array of selectors set to visibility: hidden
removeSelectors          // Array of selectors set to display: none
onReadyScript            // After the above conditions are met -- use this script to modify UI state prior to screen shots e.g. hovers, clicks etc.
hoverSelector            // Move the pointer over the specified DOM element prior to screen shot (available with default onReadyScript)
clickSelector            // Click the specified DOM element prior to screen shot (available with default onReadyScript)
postInteractionWait      // Wait for a selector after interacting with hoverSelector or clickSelector (optionally accepts wait time in ms. Idea for use with a click or hover element transition. available with default onReadyScript)
selectors                // Array of selectors to capture. Defaults to document if omitted. Use "viewport" to capture the viewport size. See Targeting elements in the next section for more info...
selectorExpansion        // See Targeting elements in the next section for more info...
misMatchThreshold        // Around of change before a test is marked failed
requireSameDimensions    // If set to true -- any change in selector size will trigger a test failure.
```


### Testing click and hover interactions
BackstopJS ships with an onReady script that enables the following interaction selectors...
```
clickSelector: ".my-hamburger-menu",
hoverSelector: ".my-hamburger-menu .some-menu-item",
```
The above would tell BackstopJS to wait for your app to generate an element with a `.my-hamburger-menu` class, then click that selector.   Then it would wait again for a `.my-hamburger-menu .some-menu-item` class, then move the cursor over that element (causing a hover state).  Then BackstopJS would take a screenshot.

You can use these properties independent of each other to easily test various click and or hover states in your app.  These are obviously simple scenarios -- if you have more complex needs then this example should serve as a pretty good starting point create your own onReady scripts.


### Setting cookies
BackstopJS ships with an onBefore script that makes it easy to import cookie files…
```
cookiePath: "backstop_data/engine_scripts/cookies.json",
```
_note: path is relative to your current working directory_

Pro tip:  If your app uses a lot of cookies then do yourself a favor and download this extension for chrome. It adds a tab to your dev-tools so you can download all your cookies as a JSON file that you can directly use with BackstopJS  https://chrome.google.com/webstore/detail/cookie-inspector/jgbbilmfbammlbbhmmgaagdkbkepnijn?hl=en




### Targeting elements

BackstopJS makes it super easy to capture screenshots of your entire layout or just parts of your layout.  This is defined in the your scenario.selectors array. Elements are defined with standard CSS notation. By default BackstopJS takes a screenshot of the first occurrence of any selector found in your DOM.  e.g. If you have three `li` tags in your layout only the first will used.

#### selectorExpansion
If you want BackstopJS to find and take screenshots of _all_ matching selector instances then there is a handy switch for that. Set `selectorExpansion` to `true` like so...
```json
scenarios: [
  {
    "selectors": [
      ".aListOfStuff li"
    ],
    "selectorExpansion": true
  }
]
// captures all <li> tags inside .aListOfStuff
```
(Default behavior) If you want very explicit control of what you capture then you can disable `selectorExpansion` and explicitly select what you want...

```json
scenarios: [
  {
    "selectors": [
      ".aListOfStuff li"
    ],
    "selectorExpansion": false
  }
]
// Just captures the first <li> tag inside .aListOfStuff
```


### Testing Progressive apps, SPAs and AJAX content

It is very common for client-side web apps is to initially download a small chunk of bootstrapping code/content/state and render it to the screen as soon as it arrives at the browser. Once this has completed, various JS components often take over to progressively load more content/state.

The problem testing these scenarios is knowing _when_ to take the screenshot.  BackstopJS solves this problem with two config properties: `readySelector`, `readyEvent` and `delay`.

#### Trigger screen capture via selector

The `readySelector` property tells BackstopJS to wait until a selector exists before taking a screenshot. For example, the following line will delay screen capture until a selector with the id '#catOfTheDayResult' is present somewhere in the DOM.

```json
"readySelector": "#catOfTheDayResult"
```

Another approach might look like this...

```json
"readySelector": "body.ember-has-rendered"
```

#### Trigger screen capture via console.log()

The `readyEvent` property enables you to trigger the screen capture by logging a predefined string to the console. For example, the following line will delay screen capture until your web app calls `console.log("backstopjs_ready")`...

```json
"readyEvent": "backstopjs_ready"
```

In the above case it would be up to you to wait for all dependencies to complete before calling logging `"backstopjs_ready"` string to the console.


#### Delay screen capture

The `delay` property enables you to pause screen capturing for a specified duration of time. This delay is applied after `readyEvent` (if also applied).

```js
"delay": 1000 //delay in ms
```

In the above case, BackstopJS would wait for one second before taking a screenshot.

In the following case, BackstopJS would wait for one second after the string `backstopjs_ready` is logged to the console.

```js
{
  // ...
  "readyEvent": "backstopjs_ready",
  "delay": 1000 //delay in ms
  // ...
}
```


### Dealing with dynamic content

For obvious reasons, this screenshot approach is not optimal for testing live dynamic content. The best way to test a dynamic app would be to use a known static content data stub – or ideally many content stubs of varying lengths which, regardless of input length, should produce certain specific bitmap output.

#### Hiding selectors

That said, for a use case where you are testing a DOM with say an ad banner or a block of dynamic content which retains static dimensions, we have the `hideSelectors` property in `capture/config.json` which will set the corresponding DOM to `visibility:hidden`, thus hiding the content from our Resemble.js analysis but retaining the original layout flow.

```json
"hideSelectors": [
  "#someFixedSizeDomSelector"
]
```

#### Removing selectors
There may also be elements which need to be completely removed during testing. For that we have `removeSelectors` which removes them from the DOM before screenshots.

```json
"removeSelectors": [
  "#someUnpredictableSizedDomSelector"
]
```

### Changing test sensitivity
`"misMatchThreshold"` (percentage 0.00%-100.00%) will change the amount of difference BackstopJS will tolerate before marking a test screenshot as "failed".  The default setting is `0.1`, this may need to be adjusted based on the kinds of testing you're doing.

More info on how misMatchThreshold is derived can be found here... https://github.com/Huddle/Resemble.js/blob/af57cb2f4edfbe718d24b350b2be1d956b764298/resemble.js#L495

`"requireSameDimensions"` (true || false) will change whether BackstopJS will accept any change in dimensions. The default setting is `true`. If set to true then the test must be the same dimensions as the reference. If set to false the test does not have to be the same dimensions as the reference.

This setting can be used in conjunction with `"misMatchThreshold"`, for example, when setting a `"misMatchThreshold"` of more than 0.00% and the mismatch causing a change in dimensions, setting `"requireSameDimensions"` to false will allow the test to still pass, setting it to true would still make it fail.


### Capturing the entire document or just the viewport, or just an element, or a combination.
BackstopJS recognizes two magic selectors: `document` and `viewport` -- these capture the entire document and just the current specified viewport respectively.  e.g.

```js
"scenarios": [
  {
    "selectors": [
      "document",
      "viewport",
      "#myFeature",
      // ...
    ],
     // ...
  }
]
```


### Testing across different environments
Comparing against different environments is easy. (e.g. compare a production environment against a staging environment).

You can create reference files (without previewing) by using the command `backstop reference`.  By default this command calls the `url` property specified in your config.  Optionally, you can add a `referenceUrl` property to your scenario configuration. If found, BackstopJS will use `referenceUrl` for screen grabs when running `$ backstop reference`.

```js
"scenarios": [
  {
    "label": "cat meme feed sanity check",
    "url": "http://www.moreCatMemes.com",
    "referenceUrl": "http://staging.moreCatMemes.com:81",
    // ...
  }
]
```


### Running custom scripts

Simulate user actions (click, scroll, hover, wait, etc.) or states (cookie values) by running your own Casper.js script on ready. For each scenario, the custom .js file you specify is imported and run when the BackstopJS ready events are fulfilled.

From your project root, place your scripts in...

```sh
./backstop_data/engine_scripts
```

at the root of your config or in your scenario...

```js
"onReadyScript": "filename.js"   // Runs after onReady event on all scenarios -- use for simulating interactions (.js suffix is optional)
"onBeforeScript": "filename.js"  // Runs before each scenario -- use for setting cookies or other env state (.js suffix is optional)
"scenarios": [
  {
    "label": "cat meme feed sanity check",
    "onReadyScript": "filename.js"   //  If found will run instead of onReadyScript set at the root (.js suffix is optional)
    "onBeforeScript": "filename.js" // If found will run instead of onBeforeScript at the root (.js suffix is optional)
     // ...
  }
]
```


Inside `filename.js`, structure it like this:

```js
// onBefore example
module.exports = function(casper, scenario, vp) {
  // scenario is the current scenario object being run from your backstop config
  // vp is the current viewport object being run from your backstop config

  // Example: setting cookies
  casper.echo("Setting cookies");
  casper.then(function(){
    casper.page.addCookie({name: 'cookieName', value: 'cookieValue'});
  });
}

// onReady example
module.exports = function(casper, scenario, vp) {
  // Example: Adding script delays to allow for things like CSS transitions to complete.
  casper.echo( 'Clicking button' );
  casper.click( '.toggle' );
  casper.wait( 250 );

  // Example: changing behavior based on config values
  if (vp.label === 'phone') {
    casper.echo( 'doing stuff for just phone viewport here' );
  }

  // ...do other cool stuff here, see Casperjs.org for a full API and many ideas.
}
```

#### Setting the base path for custom onBefore and onReady scripts

By default the base path is a folder called `engine_scripts` inside your BackstopJS installation directory. You can override this by setting the `paths.scripts` property in your `backstop.json` file to point to somewhere in your project directory (recommended).

_**NOTE:** SlimerJS currently requires an absolute path -- so be sure to include the full path when using the `"engine": "slimer"` configuration option._

```json
"paths": {
  "engine_scripts": "backstop_data/engine_scripts"
}
```


### Reporting workflow tips

One testing approach to consider is incorporating BackstopJS into your build process and just let the CLI report run on each build or before each deploy.

It's natural for your layout to break while you're in feature development -- in that case you might just run a `backstop test` when you feel things should be shaping up.

Using the `report` property in your config to enable or disable browser including/excluding the respective properties. E.G. The following settings will open a browser and write a junit report.

```json
"report": ["browser", "CI"]
```

If you choose the CI-only reporting or even no reporting (CLI is always on) you can always enter the following command to see the latest test run report in the browser.

```sh
$ backstop openReport
```

#### Test report integration with a build system like Jenkins/Travis

The following config would enable the CI - report (*default: junit format*)

```json
"report" : [ "CI" ],
```

The regression test report will be generated in the JUnit format and the report will be placed in the given directory (*default: [backstopjs dir]/test/ci_report/xunit.xml*).

You may customize the testsuite name and/or a report file (xunit.xml) path to your build report directory by using the below configuration overrides,

```js
"paths": {
  "ci_report" :  "backstop_data/ci_report"
},
"ci": {
  "format" :  "junit" ,
  "testReportFileName": "myproject-xunit", // in case if you want to override the default filename (xunit.xml)
  "testSuiteName" :  "backstopJS"
},
```

#### CLI error handling

When a layout error is found in CLI mode, BackstopJS will let you know in a general report displayed in the console. In addition, BackstopJS will return a 1 (error) to the calling CLI process.

### Setting the bitmap and script directory paths
By default, BackstopJS saves generated resources into the `backstop_data` directory in parallel with your `backstop.json` config file. The location of the various resource types are configurable so they can easily be moved inside or outside your source control or file sharing environment. See below for options...

**Tip**: these file paths are relative to your current working directory._

```json
  ...
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "engine_scripts": "backstop_data/engine_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  }
  ...
```

### Changing the rendering engine
BackstopJS supports using Chrome-Headless, PhantomJS or SlimerJS for web app rendering. Chrome-headless (chromy) is currently the default value and will be installed by default.

#### Chrome-Headless (The latest webkit library)
This will also enable the very cool _chromy.js_ (https://github.com/OnetapInc/chromy) library.  (When creating onBefore and onReady scripts please make sure you are referring to the [Chromy script documentation](https://github.com/OnetapInc/chromy).  Casper features will not work with this setting.)

**You must also have [Chrome 62 or greater installed!](https://www.google.com/chrome/browser/beta.html).**
```json
"engine": "chrome"
```

#### Slimer (Gecko/Mozilla rendering)
To run in Slimer, be sure to have SlimerJS installed. From your root directory run...

```sh
$ npm install -g slimerjs
```

Then, in your `backstop.json` config file, update the engine property to...

```json
"engine": "slimerjs"
```
That's it.

<!--
### Changing the reporting server port

The default port used by BackstopJS is 3001.   You can change it by setting the `port` parameter in the `backstop.json` file.
-->

### Setting Casper command-line flags
See casperjs documentation for more info on instance options.  An example config below...

```json
"casperFlags": [
  "--engine=slimerjs",
  "--proxy-type=http",
  "--proxy=proxyIp:port",
  "--proxy-auth=user:pass"
]
```

### Setting Chromy option flags
Chromy enables a lot of behavior via constructor options.  See Chromy documentation for more info.

**NOTE:** Backstop sets defaults for many Chromy properties. Setting a parameter value with engineOptions will override any default value set by backstop. _But please watch out for the following..._
- (TLDR) Setting `port` is _very_ _very_ not advised.
- Setting `chromeFlags` will override all chromeFlags properties set by backstop -- **EXCEPT FOR `--window-size`***...  (i.e. `--window-size` flag will be added by backstop if not found in chromeFlags)
- Setting `--window-size` explicitly in `chromeFlags` will override values used in your viewport settings.


An example config below...

```js
"engineOptions": {
  waitTimeout: 120000,
  chromePath: /path/to/chrome,
  chromeFlags: ['--disable-gpu', '--force-device-scale-factor=1']
}
```

### Integration options (local install)

TLDR; run the example here...
```
cd backstopjs/test/configs/
node multi_step node_example
```

Details...

Installing BackstopJS locally to your project makes a few integration options available.

The most basic example probably looks like this....

```
# Install from your project root
npm install backstopjs

# Set up a new project
./node_modules/backstopjs/cli/index.js init

# Run a test etc...
./node_modules/backstopjs/cli/index.js test --config=<myConfigPath>
```

If you are going to call backstop from another app you can import it into your project...

```js
const backstop = require('backstopjs');
```

#### Invoke default behavior in the current working directory context
```js
backstop('test')
  .then(() => {
    // test successful
  }).catch(() => {
    // test failed
  });
```

#### Pass options to the command
```js
backstop('test', {config:'custom/backstop/config.json'});
```

#### Pass a config object to the command
```js
// you can also pass a literal object
backstop('test', {
  config: {
    id: "foo",
    scenarios: [
      //some scenarios here
    ]
  }
});
```

#### The `--filter` argument still works too -- just pass a `filter` prop instead.
```js
// you can also pass a literal object
backstop('test', {
  filter: 'someScenarioLabelAsRegExString',
  config: {
    id: "foo",
    scenarios: [
      //some scenarios here
    ]
  }
});
```

#### Parse a config file explicitly
```js
backstop('test', {
  config: require("./backstop.config.js")({
    "foo": "bar"
  })
});


// Inside of `backstop.config.js` we export a function that returns the configuration object
module.exports = options => {
  return {
    //you can access options.foo here
  }
}
```

#### Since the backstop returns promises so it can run natively as a task in build systems like gulp
```js
const gulp = require('gulp');
const backstopjs = require('backstopjs');

gulp.task('backstop_reference', () => backstopjs('reference'));
gulp.task('backstop_test', () => backstopjs('test'));
```

#### Using npm run scripts

When BackstopJS is installed locally, NPM will recognize the `backstop <command>` pattern originating from your own npm `package.json` scripts. The following would enable you to run the respective `npm <command>` commands locally in your project.

```json
"scripts": {
  "approve": "backstop approve",
  "test": "backstop test",
  "init": "backstop init"
}
```

The above is a crude example -- there are other fancy mappings you can create as well -- check out the NPM documentation for more info.

### Tuning BackstopJS performance
During a test, BackstopJS processes image capture and image comparisons in parallel. You can adjust how much BackstopJS does at one time by changing

#### Capturing screens in parallel
By default, this value is limited to 10.  This value can be adjusted as needed to increase/decrease the amount of RAM required during a test.

The example below would capture 5 screens at a time...
```json
asyncCaptureLimit: 5
```

#### Comparing screens in parallel
By default, this value is limited to 50. This value can be adjusted as needed to increase/decrease the amount of RAM required during a test.

As a (very approximate) rule of thumb, BackstopJS will use 100MB RAM plus approximately 5 MB for each concurrent image comparison.

To adjust this value add the following to the root of your config...
```json
"asyncCompareLimit": 100
// Would require 600MB to run tests. Your mileage most likely will vary ;)
```

### Creating reference files
This Utility command will by default delete all existing screen references and create new ones based on the `referenceUrl` or `url` config config. It will not run any file comparisons.

Use this when you...
- create references from another environment (e.g. staging vs prod)
- or clean out your reference files and start fresh with all new reference
- or just create references without previewing

From your project directory...
```sh
$ backstop reference
```

optional parameters
`--config=<configFilePath>`   point to a specific config file
`--filter=<scenario.name>`    filter on scenario.name via regex string
`--i`                         incremental flag -- use if you don't want BackstopJS do first delete all files in your reference directory


### Modifying output settings of image-diffs

By specifying `resembleOutputOptions` in your backstop.json file you can modify the image-diffs transparency, errorcolor, etc. (See [Resemble.js outputSettings](https://github.com/Huddle/Resemble.js) for the full list.
```json
"resembleOutputOptions": {
  "errorColor": {
    "red": 255,
    "green": 0,
    "blue": 255
  },
  "errorType": "movement",
  "transparency": 0.3
}
```

## Developing, bug fixing, contributing...

First off, You are awesome! Thanks for your interest, time and hard work!  Here are some tips...

### We use `eslint-config-semistandard`.
Please turn your linter on. Thank you. 🙇🏽


### There is a BackstopJS sanity check

Use the command below for testing BackstopJS locally.  Everything should work.  If it doesn't, something is broke.

```
    cd <some test directory>/node_modules/backstopjs/test/configs/
    ../../cli/index.js test --config=backstop_features
```
Please make sure this is working before submitting any PR's.  Thanks!


## Troubleshooting

### Debugging
If you are using Chrome-Headless engine then you have the option of displaying the Chrome window as tests are running.  This can be helpful for visually monitoring your app state at the time of your test.  To enable use...
```json
"debugWindow": true
```

For all engines there is also the `debug` setting.  This enables verbose console output.This will also output your source payload to the terminal so you can make sure to check that the server is sending what you expect. 😉

```json
"debug": true
```

### Issues with Chrome-Headless in Docker
Please keep in mind, Chrome-Headless will need a lot of memory. Take a look at these if you are seeing weird timeout errors with Docker...

https://github.com/garris/BackstopJS/issues/603#issuecomment-346478523

https://github.com/garris/BackstopJS/issues/537#issuecomment-339710797


### `Error: Failed to launch a browser.`
Sometimes (usually after an app error) a chrome process is left open. If that's the case try...
```
pkill -f "(chrome)?(--headless)"
```

### `Chromy error: Error. See scenario ...`
Same as the above issue. If a zombie Chrome instance is blocking a port, you can run...
```
pkill -f "(chrome)?(--headless)"
```


### The dreaded: _command-not-found_ error...

Did you install BackstopJS with the global option?  If installing globally remember to add that `-g` when installing with npm *i.e.* `npm install backstop -g`.     If you installed *locally*, remember that the `backstop <command>` pattern will only be available to your npm scripts -- see the local installation section above for more info.

### Issues when installing

Somethimes bad permissions happen to good people.  It's ok, this is a safe space.  Hopefully this will help... https://github.com/garris/BackstopJS/issues/545


### Projects don't work when I share with other users or run in different environments.

Be sure to use a config `id` in your config file. See https://github.com/garris/BackstopJS/issues/291

#### If you just upgraded to 2.x or 3.x

Filename formats have changed.  To use the 1.x (compatible) file format, use the `fileNameTemplate` property like so...

```js
{
  // ...
  fileNameTemplate: '{scenarioIndex}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}',
  // ...
}
```

### Windows users...

PhantomJS needs Python -- please make sure you have Python installed...
_see https://github.com/garris/BackstopJS/issues/185_


---
## Tutorials, Extensions and more

- (RECOMMENDED Updated for version 2) Regression testing with BackstopJS, in-depth tutorial by [Angela Riggs](https://twitter.com/AngelaRiggs_) http://www.metaltoad.com/blog/regression-testing-backstopjs

- BackstopJS tutorial on [css-tricks.com](http://css-tricks.com/automating-css-regression-testing/)

-  A lovely article on [Making Visual Regression Useful](https://medium.com/@philgourley/making-visual-regression-useful-acfae27e5031#.y3mw9tnxt) by [Phillip Gourley](https://medium.com/@philgourley?source=post_header_lockup)

- Automated regression testing for AngularJS (and other) web-apps -- article on [DWB](http://davidwalsh.name/visual-regression-testing-angular-applications)

- *Grunt fans* -- check out [grunt-backstop](https://github.com/ddluc/grunt-backstop) and this [very nicely written article by Joe Watkins](http://joe-watkins.io/css-visual-regression-testing-with-grunt-backstopjs/)

- Generate a BackstopJS configuration file from sitemap.xml with [BackstopJS Scenarios Constructor](https://github.com/enzosterro/bscm/) by [Enzo Sterro](https://github.com/enzosterro)

- BackstopJS brochure at [http://BackstopJS.org/](http://garris.github.io/BackstopJS/).


## Credits
BackstopJS was created and is maintained by [Garris Shipon](https://www.linkedin.com/in/garrisshipon/)

<strong><a href="https://twitter.com/garris" class="twitter-follow-button" data-show-count="false">Follow @garris</a></strong>

💙㊗️🙇 Many many thanks to [all the contributors](https://github.com/garris/BackstopJS/graphs/contributors) with special thanks to our BackstopJS core contributors...

Features by:
- [Shinji Yamada](https://github.com/dotneet) for Chrome Headless & Chromy.JS integration support in 3.0.0.
- [Shane McGraw](https://github.com/shanemcgraw) for testing and awesomeness during 3.0 development.
- [Steve Fischer](https://github.com/stevecfischer), [uğur mirza zeyrek](mirzazeyrek), [Sven Wütherich](svwu), [Alex Bondarev](https://github.com/skip405) for concurrency support, JS config passing, JPEG support, CLI Auth support.
- [Klaus Bayrhammer](https://github.com/klausbayrhammer) for making BackstopJS a "requireable" node module in 2.3.1
- [Suresh Kumar. M](https://github.com/garris/BackstopJS/commits/master?author=nobso) for selector expansion in 1.3.2
- [@JulienPradet](https://github.com/JulienPradet), [@onigoetz](https://github.com/onigoetz), [@borys-rudenko](https://github.com/borys-rudenko), [@ksushik](https://github.com/ksushik), [@dmitriyilchgmailcom](https://github.com/dmitriyilchgmailcom), [@Primajin](https://github.com/Primajin) for giving the world BackstopJS version 2.0!
- [Suresh Kumar. M](https://github.com/garris/BackstopJS/commits/master?author=nobso) for help on the 1.3.2 release
- [Klaus Bayrhammer](https://github.com/klausbayrhammer) for all the incredible effort leading up to 1.0 -- the cli reports and compatibility fixes are awesome!
- [Evan Lovely](https://github.com/EvanLovely) and [Klaus Bayrhammer](https://github.com/klausbayrhammer) for help on the 0.9.0 release
- [Robert O'Rourke](https://github.com/sanchothefat) for help on the 0.8.0 release
- [Klaus Bayrhammer](https://github.com/klausbayrhammer) for help on the 0.7.0 release
- [Benedikt Rötsch](https://github.com/axe312ger) for help on the 0.6.0 release
- [Yulia Tsareva](https://github.com/YuliaTsareva) for help on the 0.5.0 release -- windows support
- [Lewis Nyman](https://github.com/lewisnyman) and [Stoutie](https://github.com/jehoshua02) for help with 0.4.0 release -- you guys are responsible for really getting the ball rolling!

BackstopJS uses icons from [the Noun Project](http://thenounproject.com/)

* [Tag](https://thenounproject.com/term/tag/164558/) by  [Straw Dog Design](https://thenounproject.com/StrawDogDesign)
* [Hidden](https://thenounproject.com/term/hidden/63405/) by [Roberto Chiaveri](https://thenounproject.com/robertochiaveri/)

