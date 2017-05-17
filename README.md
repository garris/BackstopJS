[![Build Status](https://travis-ci.org/garris/BackstopJS.svg)](https://travis-ci.org/garris/BackstopJS)

# BackstopJS
**Catch CSS curve balls.**


BackstopJS automates visual regression testing of your responsive web UI by comparing DOM screenshots over time.

**Features:**

- Simulate user interactions with CasperJS scripts.
- Fast inline-CLI reports.
- Detailed in-browser reports.
- CI Integration with JUnit reports.
- Test html5 elements like webfonts and flexbox.
- Use as a standalone global app, a standalone local npm script or import right into your node app.
- Also plays nice with source control -- share your gold master with your team.

## Upgrade to 2.0 for enhanced speed and new features! 

```sh
# install latest
$ npm install -g backstopjs
```

### If you've been using 1.x you will love the new performance and features in 2.x -- here's whats new...


<ul>
  <li>Install globally and invoke from anywhere with <code>`backstop &lt;command&gt;`</code></li>
  <li>Install locally and import BackstopJS directly into your node app.</li>
  <li>Selector expansion</li>
  <li>All-new, all-optimized CLI core</li>
  <li>Huge performance gains from 1.x versions</li>
  <li>Incremental reference generation</li>
  <li>Scenario filtering</li>
  <li>Custom screenshot file naming</li>
  <li>More bug fixes than you can shake a stick at</li>
  <li>Removed Gulp dependency entirely</li>
</ul>



**For 1.x users migrating to 2.x**
- BackstopJS CLI can be installed globally (and it's recommended)
- All config paths are now relative to your current working directory `$(pwd)`.
- There are new config properties
    - `fileNameTemplate` Important if you are migrating [1.x configs](#migrating-to-20)
    - `id` Use this if you are [sharing config files](#working-with-your-config-file)


----

## Contents

[The BackstopJS workflow](#the-backstopjs-workflow)

[Installation](#installation)

[Getting Started](#getting-started)

[Using BackstopJS](#using-backstopjs)

[Troubleshooting](#troubleshooting)

[Tutorials, Extensions and more](#tutorials-extensions-and-more)

[Credits](#backstory)

----

## The BackstopJS workflow

  - **Configure:** Specify URLs, screen sizes, DOM selectors, ready events, interactions etc. (see examples directory)

  - **Reference:** Create a set of *reference* screenshots. BackstopJS will consider this your *source of truth*.

  - **Test:** BackstopJS creates a set of *test* screenshots and compares them with your *reference* screenshots. Any changes show up in a visual report. (Run this after making CSS changes as many times as needed.)

  -  **Approve:** Often changes are exactly what you want. Approving changes will update your reference files with the results from your last test.


## Getting started
### Installation

#### Global installation (recommended)
Run this in your terminal from anywhere...
```sh
$ npm install -g backstopjs
```
#### Local installation

Before installing locally, keep in mind that local installs do not put the `Backstop` command on your application path. _Please refer to the [#installing-backstopjs-locally](#installing-backstopjs-locally) section of the documentation._

To install locally, `cd` into your project directory and...
```sh
$ npm install backstopjs
```
```js
// This allows you to import BackstopJS into your node scripts!   
// see #installing-backstopjs-locally 
const backstop = require('backstopjs');
```

See [#installing-backstopjs-locally](#installing-backstopjs-locally) to learn about cool BackstopJS integration options!


### Installing a development version
```sh
$ npm install -g backstopjs@beta
```

### Generating your configuration file

**If you don't already have a BackstopJS config file.** The following command will create a config template file which you can modify in your root directory. **Note: this will overwrite any existing backstopjs config file.**

From your projects's directory ...

```sh
$ backstop genConfig
```

By default, `genConfig` will put `backstop.json` at your current working path -- *if you're not sure where this is, run `echo $(pwd)`, that's your current path*. Also by default, a `backstop_data` directory will be created at this same location.

The location of the `backstop.json` file as well as all resource directories can be specified -- see [Setting the config file path](#setting-the-config-file-path-version-090) below.


### Working with your config file

#### Here is the configuration that `backstop genConfig` generates...
```json
{
  "id": "backstop_prod_test",
  "viewports": [
    {
      "name": "phone",
      "width": 320,
      "height": 480
    },
    {
      "name": "tablet_v",
      "width": 568,
      "height": 1024
    },
    {
      "name": "tablet_h",
      "width": 1024,
      "height": 768
    }
  ],
  "scenarios": [
    {
      "label": "homepage",
      "url": "https://garris.github.io/BackstopJS/",
      "selectors": [
        ".jumbotron",
        ".row.firstPanel",
        ".firstPanel .col-sm-4:nth-of-type(2)",
        ".firstPanel .col-sm-4:nth-of-type(3)",
        ".firstPanel .col-sm-4:nth-of-type(4)",
        ".secondPanel",
        ".finalWords",
        "footer"
      ],
      "selectorExpansion": true,
      "hideSelectors": [],
      "removeSelectors": [],
      "readyEvent": null,
      "delay": 500,
      "misMatchThreshold" : 0.1,
      "requireSameDimensions" : true,
      "onBeforeScript": "onBefore.js",
      "onReadyScript": "onReady.js"
    }
  ],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "casper_scripts": "backstop_data/casper_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  },
  "casperFlags": [],
  "engine": "phantomjs",
  "report": ["browser"],
  "debug": false
}
```

#### Required config properties

As a new user setting up tests for your project, you will be primarily concerned with these properties...

**`id`** – The unique name of your config file.  It's used by BackstopJS to manage and name files. It's useful to set this property for projects with multiple configs but **it's required if you plan on sharing your reference files with teammates**.  If you're not sharing with others then you can omit this property -- BackstopJS will auto-generate one for you based on your file system.

**`viewports`** – An array of screen size objects your DOM will be tested against.  Add as many as you like -- but add at least one.

**`scenarios`** – This is where you set up your actual tests. The important sub properties are...

- **`scenarios[n].label`** – Required. Used for screenshot naming.
- **`scenarios[n].url`** – Required. Tells BackstopJS what endpoint/document you want to test.  This can be an absolute URL or local to your current working directory.
- **`scenarios[n].selectors`** – An array of CSS selector strings enabling you specify what part of your DOM you want to test.  The default value is `document`, which will attempt to capture your entire layout.


### Creating or updating reference bitmaps

From your project directory...
```sh
$ backstop reference
```

This will create a `bitmaps_reference` directory with screen captures of all DOM elements specified in your config. See [scenario filtering](https://github.com/garris/BackstopJS#incremental-scenario-referencetesting-filtering) for more options.



### Generating test bitmaps

```sh
$ backstop test
```

This will create a new set of bitmaps in `bitmaps_test/<timestamp>/`

Once the test bitmaps are generated, a report comparing the most recent test bitmaps against the current reference bitmaps will run.

Changes will be detected and displayed in the browser report and a summary will show up in your terminal.




### Approving changes

```sh
$ backstop approve
```

Sometimes, change is good!  When running this command, all images (with changes) from your most recent test batch will be promoted to your reference collection. Subsequent tests will be compared against your updated reference files.

SEE: [filtering tests and references by scenario](#Filtering-tests-and-references-by-scenario) for a note on approving changes after running `backstop test` using the `--filter` argument.


## Using BackstopJS

### Targeting elements

BackstopJS makes it super easy to capture screenshots of your entire layout or just parts of your layout.  This is defined in the your scenario.selectors array. Each element of your array accepts standard CSS notation. By default BackstopJS takes a screenshot of the first occurance of any selector found in your DOM.  e.g. If you have three `li` tags in your layout only the first will used.

#### selectorExpansion

If you want BackstopJS to find and take screenshots of _all_ matching selector instances then there is a handy switch for that. Set `selectorExpansion` to `true` like so...
```
scenarios: [
  {
    "selectorExpansion": true,
    "selectors": [
      ".aListOfStuff li"
    ]
  }
]
// captures all li children of the .aListOfStuff node
```
(Default behavior) If you want very explicit controll of what you capture then you can disable `selectorExpansion` and explictly select what you want...

```
scenarios: [
  {
    "selectorExpansion": false,
    "selectors": [
      ".aListOfStuff li:nth-of-type(1)"
      ".aListOfStuff li:nth-of-type(2)"
      ".aListOfStuff li:nth-of-type(3)"
    ]
  }
]
// Attempts to capture these three elements explicitly.
```


### Filtering tests and references by scenario

If you only want to run a subset of your BackstopJS tests you can do so by invoking BackstopJS with the `--filter` argument. `--filter` takes a regEx string and compares it against your scenario labels. Non-matching scenarios are ignored.
```
$ backstop reference --filter=<scenario.label>
```

Note: If you run `backstop approve` after running a filtered test -- only matching test bitmaps will be promoted to your reference directory.


### Incremental reference updates

By default `backstop.reference` will first remove all files in your reference directory then generate screenshots of all selectors specified in your config file.

If you don't want BackstopJS do first delete all files in your reference directory you can enable the `incremental` flag.
```
$ backstop reference --i
```




### Testing SPAs and AJAX content

It is very common for client-side web apps is to initially download a small chunk of bootstrapping code/content and render it to the screen as soon as it arrives at the browser. Once this has completed, various JS components often take over to progressively load more content.

The problem testing these scenarios is knowing _when_ to take the screenshot.  BackstopJS solves this problem with two config properties: `readyEvent` and `delay`.

**NOTE: Advanced options also include very cool CasperJS features like waitForSelector() and waitUntilVisible() – see [adding custom CasperJS scripts](https://github.com/garris/BackstopJS#running-custom-casperjs-scripts) for more info...**

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
  ...
  "readyEvent": "backstopjs_ready",
  "delay": 1000 //delay in ms
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

More info on how misMatchThreshold is derrived can be found here... https://github.com/Huddle/Resemble.js/blob/af57cb2f4edfbe718d24b350b2be1d956b764298/resemble.js#L495

`"requireSameDimensions"` (true || false) will change whether BackstopJS will accept any change in dimensions. The default setting is `true`. If set to true then the test must be the same dimensions as the reference. If set to false the test does not have to be the same dimensions as the reference.

This setting can be used in conjunction with `"misMatchThreshold"`, for example, when setting a `"misMatchThreshold"` of more than 0.00% and the mismatch causing a change in dimensions, setting `"requireSameDimensions"` to false will allow the test to still pass, setting it to true would still make it fail. 


### Capturing the entire document
BackstopJS recognizes a magic selector called `document`.  Use it to capture your entire HTML document (regardless of the height specified in your `viewports` object).

```js
  "scenarios": [
    {
      "selectors": [
        "document",
        ...
      ],
       ...
    }
```
_Note: This is required if you want to test an entire document layout with a `height: 100%` rule specified on the `<body>` element._



### Testing across different environments
Comparing against different environments is easy. (e.g. compare a production environment against a staging environment).

To do this, add a `referenceUrl` to your scenario configuration. When running `$ backstop test` BackstopJS will use the `url` for screen grabs.  When running `$ backstop reference` BackstopJS will check for `referenceUrl` and use that if it's there. Otherwise it will use `url` for both.

```js
  "scenarios": [
    {
      "label": "cat meme feed sanity check",
      "url": "http://www.moreCatMemes.com",
      "referenceUrl": "http://staging.moreCatMemes.com:81",
       ...
    }
```


### Running custom CasperJS scripts

Simulate user actions (click, scroll, hover, wait, etc.) or states (cookie values) by running your own Casper.js script on ready. For each scenario, the custom .js file you specify is imported and run when the BackstopJS ready event is fired.

From your project root, place your scripts in...

```sh
./backstop_data/casper_scripts
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
       ...
    }
```


Inside `filename.js`, structure it like this:

```js
module.exports = function(casper, scenario, vp) {
  // scenario is the current scenario object being run from your backstop config
  // vp is the current viewport object being run from your backstop config

  // Example: setting cookies
  casper.echo("Setting cookies");
  casper.then(function(){
    casper.page.addCookie({some: 'cookie'});
  });
  // `casper.thenOpen()` demonstrates a redirect to the original page with your new cookie value.
  // this step is not required if used with _onBeforeScript_
  casper.thenOpen(scenario.url);

  // Example: Adding script delays to allow for things like CSS transitions to complete.
  casper.echo( 'Clicking button' );
  casper.click( '.toggle' );
  casper.wait( 250 );

  // Example: changing behavior based on config values
  if (vp.name === 'phone') {
    casper.echo( 'doing stuff for just phone viewport here' );
  }

  // ...do other cool stuff here, see Casperjs.org for a full API and many ideas.
}
```

#### Setting the base path for custom CasperJS scripts

By default the base path is a folder called `scripts` inside your BackstopJS installation directory. You can override this by setting the `paths.scripts` property in your `backstop.json` file to point to somewhere in your project directory (recommended).

_**NOTE:** SlimerJS currently requires an absolute path -- so be sure to include the full path when using the `"engine": "slimer"` configuration option._

```json
  "paths": {
    "casper_scripts": "backstop_data/scripts"
  }
```


### Reporting workflow tips

One testing approach to consider is incorporating BackstopJS into your build process and just let the CLI report run on each build.  It's natural for your layout to break while you're in feature development -- refer back to the report when you feel things should be shaping up. Check the in-browser version of the report occasionally as needed when you need deeper information about what's happening in a test case.

_CLI Report_

![](homepage/img/CLI_report.png)


_Browser Report_

![](homepage/img/browserReport.png)


Using the report property in `backstop.json` enable or disable browser including/excluding the respective properties. E.G. The following settings will run both reports at the same time.

```json
"report": ["browser", "CI"]
```

If you choose the CI-only reporting you can always enter the following command to see the latest test run report in the browser.

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

When a layout error is found in CLI mode, BackstopJS will let you know in a general report displayed in the console. In addition, BackstopJS will throw an error that will be passed to calling process.

### Using a js based config file

JSON-based configs cramping your style? Well, here's some good news -- BackstopJS allows you to import all config parameters as a node module (as an option instead of JSON) which allows you to use comments, variables and logic etc. inside of your config.

To use a js module based config file, explicitly specify your config filepath when running a command. e.g.

```sh
$ backstop test --config=backstopTests/someTest.js
```
_See the next section for more info on setting the config file path._

Be sure to export your config object as a node module.



### Setting the config file path
Often, users have multiple config files to test various different scenarios or even different projects. By default, BackstopJS looks for `backstop.json` in your project's root directory (in parallel with your `node_modules` directory). You can override this by passing a `--config` argument when running any command. e.g.

```sh
# example 1: run reference generation with absolute path
$ backstop reference --config=~/backstopTests/someTest.json
# Will capture reference files using scenarios from someTest.json inside backstopTests inside your home folder.

# example 2: run test with absolute path
$ backstop test --config=~/backstopTests/someTest.json
# Will run tests using scenarios from `someTest.json` inside `backstopTests` inside your home folder.

# example 3: run test with relative path
$ backstop test --config=backstopTests/someTest.json
# Will run tests using scenarios from `someTest.json` inside `backstopTests` inside your project root folder.

# example 4: run test with relative path and JS module
$ backstop test --config=backstopTests/someTest.js
# You can also specify your config parameters as a node module. This will import `someTest.js` from `backstopTests` inside your project root folder.
```

NOTES:
- all paths are relative to the location of the BackstopJS install directory _(which is either inside your project's `node_modules` or `bower_components` depending on how BackstopJS was installed)._
- _Remember to add that extra `--` after the `backstop test` and `backstop reference` commands._

### Setting the bitmap and script directory paths
By default, BackstopJS saves generated resources into the `backstop_data` directory in parallel with your `backstop.json` config file. The location of the various resource types are configurable so they can easily be moved inside or outside your source control or file sharing environment. See below for the options...

_Please note: these file paths are relative to your current working directory $(pwd)._

```json
  ...
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "casper_scripts": "backstop_data/casper_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  }
```

### Changing the rendering engine
BackstopJS supports using PhantomJS or SlimerJS for web app rendering. (With thanks to CasperJS for doing the heavy lifting here.)

First, be sure to have SlimerJS installed. From your root directory run...

```sh
$ sudo npm install -g slimerjs
```

Then, in your `backstop.json` config file, update the engine property to...

```json
  "engine": "slimerjs"
```
Thats it.

<!--
### Changing the reporting server port

The default port used by BackstopJS is 3001.   You can change it by setting the `port` parameter in the `backstop.json` file.
-->

### Setting Casper command-line flags
This is for you if for some reason you find yourself needing advanced configuration access to CasperJS.  You can set CasperJS flags via `casperFlags` like so...

```json
"casperFlags": [
  "--engine=slimerjs",
  "--proxy-type=http",
  "--proxy=proxyIp:port",
  "--proxy-auth=user:pass"
]
```

### Installing BackstopJS Locally
The main reason to install backstop locally is likely to be a managed integration with a build implementation. There are two ways to run a local installation of backstop

#### Importing into your node scripts

To Using it in a build system you can simply require a local backstop installation in your project.
```js
const backstop = require('backstopjs');

backstop('reference');

// handle the response like this
backstop('test')
  .then(() => {
    // test successful
  }).catch(() => {
    // test failed
  });

// pass options to the command
backstop('test', {config:'custom/backstop/config.json'});
```

##### You can pass a config object directly

```
backstop('test', {
    config: {
        id: "foo",
        scenarios: [
            //some scenarios here
        ]
    }
});
```

It can also be useful if you want to pass the config some parameters and return a JS object.

```
backstop('test', {
    config: require("./backstop.config.js")({
        "foo": "bar"
    })
});
```

Inside of `backstop.config.js` we export a function that returns the configuration object

```
module.exports = options => {
    return {
        //you can access options.foo here
    }
}
```

Since the backstop runner returns promises it can easily be integrated in build systems like gulp
```js
const gulp = require('gulp');
const backstopjs = require('backstopjs');

gulp.task('backstop_reference', () => backstopjs('reference'));
gulp.task('backstop_test', () => backstopjs('test'));
```

#### Using npm run scripts

From the...
```
<your-project-path>/node_modules/backstopjs/
```
...directory you can run...
```
$ npm run reference
$ npm run test
$ npm run genConfig
$ npm run openReport
```
Which maps to the respective `backstop <command>`.

Alternatively, when BackstopJS is installed locally, NPM will recognize the `backstop <command>` pattern originating from your own NPM `package.json` scripts. The following would enable you to run the
```
scripts: {
  reference: backstop reference
  test: backstop test
  genConfig: backstop genConfig
}
```

The above is a crude example -- there are other fancy mappings you can create as well -- check out the NPM documentation for more info.

### Modifying output settings of image-diffs

By specifying `resembleOutputOptions` in your backstop.json file you can modify the image-diffs transparency, errorcolor, etc. (See [Resemble.js outputSettings](https://github.com/Huddle/Resemble.js) for the full list.

e.g.
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

### Tuning BackstopJS performance 
During a test, BackstopJS processes image comparisons in parallel. By default, this value is limited to 50. Used this way, BackstopJS can utilize available processor power while keeping RAM usage under control.

This value can be adjusted as needed to increase/decrease the amount of RAM required during a test.

As a (very approximate) rule of thumb, BackstopJS will use 100MB RAM plus approximately 5 MB for each concurrent image comparison.

To adjust this value add the following to the root of your config...
```
"asyncCompareLimit": 100
// Would require 600MB to run tests.
``` 


## Troubleshooting

### Migrating to 2.0

_Filename issue: Projects don't work when I share with other users or run in different environments._

#### If you just upgraded to 2.x from 1.x

Filename formats have changed.  To use the 1.x (compatible) file format, use the `fileNameTemplate` property like so...

```
{
...
fileNameTemplate: '{scenarioIndex}_{scenarioLabel}_{selectorIndex}_{selectorLabel}_{viewportIndex}_{viewportLabel}',
...
```

#### If you are not migrating scripts but have recently upgraded BackstopJS

Be sure to use a config `id` in your config file. See https://github.com/garris/BackstopJS/issues/291

### Windows users...

PhantomJS needs Python -- please make sure you have Python installed...
_see https://github.com/garris/BackstopJS/issues/185_


### The dreaded _command-not-found_ error...

Did you install BackstopJS with the global option?  If installing globally remember to add that `-g` when installing with npm *i.e.* `npm install backstop -g`.     If you installed *locally*, remember that the `backstop <command>` pattern will only be available to your npm scripts -- see the local installation section above for more info.


### Debugging

To enable verbose console output when running your tests set the `debug` property to `true` in `backstop.json`.  This will also output your  payload to the terminal so you can make sure to check that the server is sending what you expect. 😉

```json
  "debug": true
```


---
## Tutorials, Extensions and more

- (RECOMMEDED Updated for version 2) Regression testing with BackstopJS, in-depth tutorial by [Angela Riggs](https://twitter.com/AngelaRiggs_) http://www.metaltoad.com/blog/regression-testing-backstopjs

- BackstopJS tutorial on [css-tricks.com](http://css-tricks.com/automating-css-regression-testing/) 

-  A lovely article on [Making Visual Regression Useful](https://medium.com/@philgourley/making-visual-regression-useful-acfae27e5031#.y3mw9tnxt) by [Phillip Gourley](https://medium.com/@philgourley?source=post_header_lockup)

- Automated regression testing for AngularJS (and other) web-apps -- article on [DWB](http://davidwalsh.name/visual-regression-testing-angular-applications)

- *Grunt fans* -- check out [grunt-backstop](https://github.com/ddluc/grunt-backstop) and this [very nicely written article by Joe Watkins](http://joe-watkins.io/css-visual-regression-testing-with-grunt-backstopjs/)

- Generate a BackstopJS configuration file from sitemap.xml with [BackstopJS Scenarios Constructor](https://github.com/enzosterro/bscm/) by [Enzo Sterro](https://github.com/enzosterro)

- BackstopJS brochure at [http://BackstopJS.org/](http://garris.github.io/BackstopJS/).


## Backstory
BackstopJS is a useful wrapper around the very fabulous [Resemble.js](https://github.com/Huddle/Resemble.js) component written by [James Cryer](https://github.com/jamescryer). Other implementations of Resemble.js, namely [PhantomCSS](https://github.com/Huddle/PhantomCSS) require writing long form [CasperJS](http://casperjs.org) tests -- which is of course great for testing complex UI interactions –- but kind of cumbersome for testing simple applications like static CMS templates, lots and lots of app states and different screen sizes.

BackstopJS may be just the thing if you develop custom WordPress, Drupal or other CMS templates.  Tested on OSX.

BackstopJS was created by [Garris Shipon](expanded.me) during the [Art.com labs](www.art.com) years.

<strong><a href="https://twitter.com/garris" class="twitter-follow-button" data-show-count="false">Follow @garris</a></strong>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>


---

## Gratitude 💙㊗️🙇
Many many thanks to [all the contributors](https://github.com/garris/BackstopJS/graphs/contributors) with special thanks to our BackstopJS core contributors...

Ongoing Reviews by:
- [Steve Fischer](https://github.com/stevecfischer)
- [uğur mirza zeyrek](mirzazeyrek)
- [Sven Wütherich](svwu)

Features by:
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
- [Yulia Tsareva](https://github.com/YuliaTsareva) for help on the 0.5.0 release
- [Lewis Nyman](https://github.com/lewisnyman) and [Stoutie](https://github.com/jehoshua02) for help with 0.4.0 release -- you guys are responsible for really getting the ball rolling!

BackstopJS uses icons from [the Noun Project](http://thenounproject.com/)

* [Tag](https://thenounproject.com/term/tag/164558/) by  [Straw Dog Design](https://thenounproject.com/StrawDogDesign)
* [Hidden](https://thenounproject.com/term/hidden/63405/) by [Roberto Chiaveri](https://thenounproject.com/robertochiaveri/)

---
