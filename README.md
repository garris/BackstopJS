[![Build Status](https://travis-ci.org/garris/BackstopJS.svg)](https://travis-ci.org/garris/BackstopJS)

#BackstopJS
**Catch CSS curve balls.**


BackstopJS automates CSS regression testing of your responsive web UI by comparing DOM screenshots at various viewport sizes.

**Features:** Plays nice with multiple config files – Simulate user interactions with CasperJS scripts – Fast inline-CLI reports – detailed in-browser reports – Test html5 elements like webfonts and flexbox – also plays nice with source control.




## News


### Version 0.9.0 beta available now
**Now plays nice with multiple config files!**
For more info see... **[Setting the config file path](#setting-the-config-file-path-version-090)** below.

To try the new feature, install the beta version...

    $ npm install garris/backstopjs#master

[Please file questions, comments or issues here](https://github.com/garris/BackstopJS/issues).


####Version 0.8.0
- Simulate user interactions with CasperJS scripts

####Version 0.7.0
- Fast CLI reporting

####Version 0.6.0
- configurable screenshot locations. See *moving the bitmap directories* below.
- SlimerJS support. See *changing the rendering engine* below.




## Tutorials and Related Links

- Good news for *Gulp fans*, BackstopJS is written on top of Gulp -- so you'll be right at home. *Grunt fans* -- check out [grunt-backstop](https://github.com/ddluc/grunt-backstop) and this [very nicely written article by Joe Watkins](http://joe-watkins.io/css-visual-regression-testing-with-grunt-backstopjs/)

- Basic automated regression testing article on [css-tricks.com](http://css-tricks.com/automating-css-regression-testing/)

- Automated regression testing for AngularJS (and other) web-apps -- article on [DWB](http://davidwalsh.name/visual-regression-testing-angular-applications)

- Want to add BackstopJS to your existing gulp build?  Turns out to be pretty easy – use **gulp-chug**. Learn how in this article by [Filip Bartos](http://blog.bartos.me/css-regression-testing/)


BackstopJS brochure at [http://BackstopJS.org/](http://garris.github.io/BackstopJS/).



##Heres how it works:

1. Set up a test config file: specify screen sizes and DOM selectors.
2. Use BackstopJS to create reference screenshots.
3. Make some changes to your CSS or add new DOM components.
4. Run a test. BackstopJS creates a set of *test* screenshots and compares them with the *reference screenshots* you made in step 2 above. Any unwanted/unforeseen changes show up in a nice report.


##Backstory:
BackstopJS is a useful wrapper around the very fabulous [Resemble.js](https://github.com/Huddle/Resemble.js) component written by [James Cryer](https://github.com/jamescryer). Other implementations of Resemble.js, namely [PhantomCSS](https://github.com/Huddle/PhantomCSS) require writing long form [CasperJS](http://casperjs.org) tests -- which is of course great for testing complex UI interactions –- but kind of cumbersome for more simple applications like static CMS templates or lots and lots of app states at different screen sizes.

BackstopJS may be just the thing if you develop custom WordPress, Drupal or other CMS templates.  Tested on OSX.

BackstopJS was created by [Garris Shipon](expanded.me) at [Art.com labs](www.art.com).

<strong><a href="https://twitter.com/garris" class="twitter-follow-button" data-show-count="false">Follow @garris</a></strong>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>


...

## Many many thanks to [all the contributors](https://github.com/garris/BackstopJS/graphs/contributors) with special thanks to...
- [Evan Lovely](https://github.com/EvanLovely) and [Klaus Bayrhammer](https://github.com/klausbayrhammer) for help on the 0.9.0 release
- [Robert O'Rourke](https://github.com/sanchothefat) for help on the 0.8.0 release
- [Klaus Bayrhammer](https://github.com/klausbayrhammer) for help on the 0.7.0 release
- [Benedikt Rötsch](https://github.com/axe312ger) for help on the 0.6.0 release
- [Yulia Tsareva](https://github.com/YuliaTsareva) for help on the 0.5.0 release
- [Lewis Nyman](https://github.com/lewisnyman) and [Stoutie](https://github.com/jehoshua02) for help with 0.4.0 release

BackstopJS uses icons from [the Noun Project](http://thenounproject.com/)

* [Tag](https://thenounproject.com/term/tag/164558/) by  [Straw Dog Design](https://thenounproject.com/StrawDogDesign)
* [Hidden](https://thenounproject.com/term/hidden/63405/) by [Roberto Chiaveri](https://thenounproject.com/robertochiaveri/)

---

##Installation

**BackstopJS package**

You can add BackstopJS from the root directory of any project.

    $ npm install --save-dev backstopjs


This will create the folder structure `./node_modules/backstopjs`.


**If you don't already have a global Gulp instance...** http://gulpjs.com

    $ sudo npm install -g gulp

    //test for a correct install with...
    $ gulp -v
    > CLI version 3.8.10
    > Local version 3.8.10


**If you don't already have a global PhantomJS install...** http://phantomjs.org/download.html

    $ sudo npm install -g phantomjs

    //test for a correct install with...
    $ phantomjs -v
    > 1.9.8


**If you don't already have a global CasperJS install...** http://docs.casperjs.org/en/latest/installation.html

    $ sudo npm install -g casperjs

    //test for a correct install with...
    $ casperjs --version
    > 1.1.0-beta3


###Note for windows installation

Windows users who have trouble getting BackstopJS to run (e.g. Error: spawn ENOENT) may want to look at [ENOENT error #2](https://github.com/garris/BackstopJS/issues/2). Also, please check that PhantomJS, CasperJS and Python are installed and added to your console PATH.


###Installing a develpment version

    $ npm install garris/backstopjs#master


##Configuration


**If you don't already have a BackstopJS config file.** The following command will create a config template file which you can modify in your root directory. *Note: this will overwrite any existing backstopjs config file.*

From `./node_modules/backstopjs` ...

    $ gulp genConfig


By default, `genConfig` will put `backstop.json` at the project root. Also by default, a `backstop_data` directory will be created at this same location.

The location of the `backstop.json` file as well as all resource directories can be specified -- see [Setting the config file path](#setting-the-config-file-path-version-090) below.

**A step-by-step tutorial is at [css-tricks.com](http://css-tricks.com/automating-css-regression-testing/).**


```json
{
  "viewports": [
    {
      "name": "phone",
      "width": 320,
      "height": 480
    }, {
      "name": "tablet_v",
      "width": 568,
      "height": 1024
    }, {
      "name": "tablet_h",
      "width": 1024,
      "height": 768
    }
  ],
  "scenarios": [
    {
      "label": "http://getbootstrap.com",
      "url": "http://getbootstrap.com",
      "hideSelectors": [],
      "removeSelectors": [
        "#carbonads-container"
      ],
      "selectors": [
        "header",
        "main",
        "body .bs-docs-featurette:nth-of-type(1)",
        "body .bs-docs-featurette:nth-of-type(2)",
        "footer",
        "body"
      ],
      "readyEvent": null,
      "delay": 500,
      "onReadyScript": null
    }
  ],
  "paths": {
    "bitmaps_reference": "../../backstop_data/bitmaps_reference",
    "bitmaps_test": "../../backstop_data/bitmaps_test",
    "compare_data": "../../backstop_data/bitmaps_test/compare.json",
    "scripts": "../../backstop_data/scripts"
  },
  "engine": "phantomjs",
  "report": ["browser", "CLI"],
  "cliExitOnFail": false,
  "debug": false
}
```




**DEV NOTE:** If `./backstop.json` is not present at the project root then BackstopJS will fallback to use the following config at... `./node_modules/backstopjs/capture/config.default.json`



## Usage Notes

### Generating (or updating) reference bitmaps

    $ gulp reference


This task will create a (or update an existing) `bitmaps_reference` directory with screen captures from the current project build.



### Generating test bitmaps

    $ gulp test

This task will create a new set of bitmaps in `bitmaps_test/<timestamp>/`

Once the test bitmaps are generated, a report comparing the most recent test bitmaps against the current reference bitmaps will run. Significant differences will be detected and shown.



### Testing SPAs and AJAX content

It is very common for client-side web apps is to initially download a small chunk of bootstrapping code/content and render it to the screen as soon as it arrives at the browser. Once this has completed, various JS components often take over to progressively load more content.

The problem testing these scenarios is knowing _when_ to take the screenshot.  BackstopJS solves this problem with two config properties: `readyEvent` and `delay`.

####Trigger screen capture via console.log()

The `readyEvent` property enables you to trigger the screen capture by logging a predefined string to the console. For example, the following line will delay screen capture until your web app calls `console.log("backstopjs_ready")`...

    "readyEvent": "backstopjs_ready"

In the above case it would be up to you to wait for all dependencies to complete before calling logging `"backstopjs_ready"` string to the console.


####Delay screen capture

The `delay` property enables you to pause screen capturing for a specified duration of time. This delay is applied after `readyEvent` (if also applied).

    "delay": 1000 //delay in ms

In the above case, BackstopJS would wait for one second before taking a screenshot.

In the following case, BackstopJS would wait for one second after the string `backstopjs_ready` is logged to the console.

    {
    ...
    "readyEvent": "backstopjs_ready",
    "delay": 1000 //delay in ms
    }

<!--
####set HTTP cookie for login-required pages

The `cookiesJsonFile` property enables you to add HTTP cookie for capturing login-required pages.

    "cookiesJsonFile": "./path/to/cookies.json"

The `cookiesJsonFile` file should have this format.

    [
      {
        "name": "mycookie",
        "value": "1",
        "domain": "localhost",
        "path": "/"
      }
    ]
 -->

### Dealing with dynamic content

For obvious reasons, this screenshot approach is not optimal for testing live dynamic content. The best way to test a dynamic app would be to use a known static content data stub – or ideally many content stubs of varying lengths which, regardless of input length, should produce certain specific bitmap output.

#### Hiding selectors

That said, for a use case where you are testing a DOM with say an ad banner or a block of dynamic content which retains static dimensions, we have the `hideSelectors` property in `capture/config.json` which will set the corresponding DOM to `visibility:hidden`, thus hiding the content from our Resemble.js analysis but retaining the original layout flow.

    "hideSelectors": [
    	"#someFixedSizeDomSelector"
    ]

#### Removing selectors
There may also be elements which need to be completely removed during testing. For that we have `removeSelectors` which sets elements to `display:none`.

    "removeSelectors": [
    	"#someUnpredictableSizedDomSelector"
    ]
    
### Running custom CasperJS scripts (version 0.8.0+)

Simulate user actions (click, scroll, hover, wait, etc.) by running your own Casper.js script on ready. For each scenario, the custom .js file you specify is imported and run when the BackstopJS ready event is fired.

From your project root, place your scripts in...

    ./backstop_data/casper_scripts
    
And in your scenario...

    "onReadyScript": "filename.js"   // the .js suffix is optional
                                     // empty filenames are ignored

Inside `filename.js`, structure it like this:

```js
module.exports = function(casper, scenario, vp) {
  casper.echo( 'Clicking button' );
  casper.click( '.toggle' );
  if (vp.name === 'phone') {
    // do stuff for just phone viewport here
  }
  // do other cool stuff here, see Casperjs.org for a full API and many ideas.
  // scenario is the current scenario object being run from your backstop.json file
}
```

#### Setting the base path for custom CasperJS scripts

By default the base path is a folder called `scripts` inside your BackstopJS installation directory. You can override this by setting the `paths.scripts` property in your `backstop.json` file to point to somewhere in your project directory (recommended).

_**NOTE:** SlimerJS currently requires an absolute path -- so be sure to include the full path when using the `"engine": "slimer"` configuration option._

```
  "paths": {
    "casper_scripts": "../../backstop_data/scripts"
  }
```



### Reporting workflow tips (version 0.7.0+)
There are two reporting options.  The fastest and least obtrusive is the CLI report which gives you a subdued thumbs up or thumbs down for your layout on each run.  The other report runs in the in-browser -- this gives you detailed visual feedback for each test case so you can validate why your screen diffs score the way they do.

One testing approach to consider is incorporating BackstopJS into your build process and just let the CLI report run on each build.  It's natural for your layout to break while you're in feature development -- refer back to the report when you feel things should be shaping up. Check the in-browser version of the report occasionally as needed when you need deeper information about what's happening in a test case.

_CLI Report_

![](homepage/img/CLI_report.png)


_Browser Report_

![](homepage/img/browserReport.png)


Using the report property in `backstop.json` enable or disable browser or server-side-reporting by including/excluding the respective properties. The following settings will run both reports at the same time.

    "report": ["browser", "CLI"]

If you choose the CLI-only reporting you can always enter the following command to see the latest test run report in the browser.

    $ gulp openReport


####CLI error handling 

When a layout error is found in CLI mode, BackstopJS will let you know in a general report displayed in the console. Optionally, BackstopJS can throw an error that can be passed to calling process. For this behavior enable `cliExitOnFail` in your config... 

```
"cliExitOnFail": true,
```

###Setting the config file path (version 0.9.0+)
Often, users have multiple config files to test various different scenarios or even different projects. By default, BackstopJS looks for `backstop.json` in your project's root directory (in parallel with your `node_modules` directory). You can override this by passing a `--backstopConfigFilePath` argument when running any command. e.g.
```
// example 1
$ gulp reference --backstopConfigFilePath=~/backstopTests/someTest.json
// Will capture reference files using scenarios from `someTest.json` inside `backstopTests` inside your home folder.

// example 2
$ gulp test --backstopConfigFilePath=~/backstopTests/someTest.json
// Will run tests using scenarios from `someTest.json` inside `backstopTests` inside your home folder.

// example 3
$ gulp test --backstopConfigFilePath=../../backstopTests/someTest.json
// Will run tests using scenarios from `someTest.json` inside `backstopTests` inside your project root folder.

```

NOTE: all paths are relative to the location of the BackstopJS install directory _(which is either inside your project's `node_modules` or `bower_components` depending on how BackstopJS was installed)_



### Setting the bitmap and script directory paths (version 0.6.0+)
By default, BackstopJS saves its screenshots into `./backstopjs/bitmaps_reference/` and `./backstopjs/bitmaps_test/` in parallel with your `./backstop.js` config file. The location of these directories are configurable so they can easily be moved inside or outside your source control or file sharing environment.

The `compare.json` file contains file mappings between reference and test files. This file tells the comparison module what comparisons to run. It is probably best kept inside the `bitmaps_test` directory.

If you are using custom casper_scripts -- that directory can be specified too.

Please note: these file paths are relative to your `./node_modules/backstopjs/` directory.



```
  "paths": {
    "bitmaps_reference": "../../backstop_data/bitmaps_reference",
    "bitmaps_test": "../../backstop_data/bitmaps_test",
    "compare_data": "../../backstop_data/bitmaps_test/compare.json",
    "casper_scripts": "../../backstop_data/scripts"
  }
```

### Changing the rendering engine (version 0.6.0+)
BackstopJS supports using PhantomJS or SlimerJS (With thanks to CasperJS for doing the heavy lifting here.)

PhantomJS, the default rendering engine, does not correctly interpret flexbox and web fonts -- so if you are using those things in your app you will be way more happy using SlimerJS. Here is how to do that...

First, install SlimerJS. From your root directory run...
```
$ sudo npm install -g slimerjs
```
Then, in your `backstop.json` config file, update the engine property to...
```
  "engine": "slimerjs"
```
Thats it.



### Setting Casper command-line flags (version 0.9.0+)
This is for you if for some reason you find yourself needing advanced configuration access to CasperJS.  You can set CasperJS flags via `casperFlags` like so...

```
"casperFlags": [
  "--engine=slimerjs", 
  "--proxy-type=http",
  "--proxy=proxyIp:port", 
  "--proxy-auth=user:pass"
]
```


### Troubleshooting


####Sometimes users run into this gulp-not-found error...

    Local gulp not found in ~/path-to-your-project-root/
    Try running: npm install gulp

If this happens then you may not be in the right directory – try...

    cd node_modules/backstopjs/

Then try running BackstopJS again.


####Debugging
To enable verbose console output when running your tests set the `debug` property to `true` in `backstop.json`.

```
  "debug": true
```

#### View file contents

Sometimes it also helps to verify that BackstopJS is receiving the correct file contents. Enabling the `debug` property (above) will output this data to the console whenever a test is run. 

You can also use the following command -- it will output your file contents to the console.

From `./node_modules/backstopjs` ...

    $ gulp echo




### Running the report server

The test comparison report was written in Angular.js and requires a running HTTP server instance.  This instance is auto-started after a test is run.  The server is also auto-stopped after 15 minutes so you don't have to go worrying about node processes running all over the place.

You can manually start the server optionally passing your own timeout parameter (in minutes). Passing 0 will disable the timeout feature and run the server until you manually stop it.

From `./node_modules/backstopjs` ...

    $ gulp start -t 0



To manually stop the server, from `./node_modules/backstopjs` ...

    $ gulp stop





**fin.**
