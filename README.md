[![Build Status](https://travis-ci.org/garris/BackstopJS.svg)](https://travis-ci.org/garris/BackstopJS)

#BackstopJS
**Catch CSS curve balls.**


BackstopJS automates CSS regression testing of your responsive web UI by comparing DOM screenshots at various viewport sizes.

## Tutorials and Related Links

- Good news for *Gulp fans*, BackstopJS is written on top of Gulp -- so you'll be right at home. *Grunt fans* -- check out [grunt-backstop](https://github.com/ddluc/grunt-backstop) and this [very nicely written article by Joe Watkins](http://joe-watkins.io/css-visual-regression-testing-with-grunt-backstopjs/)

- Basic automated regression testing article on [css-tricks.com](http://css-tricks.com/automating-css-regression-testing/)
    
- Automated regression testing for AngularJS (and other) web-apps -- article on [DWB](http://davidwalsh.name/visual-regression-testing-angular-applications)
    

BackstopJS brochure at [http://BackstopJS.org/](http://garris.github.io/BackstopJS/).

Many many thanks to [all the contributors](https://github.com/garris/BackstopJS/graphs/contributors) with special thanks to [Lewis Nyman](https://github.com/lewisnyman) and [Stoutie](https://github.com/jehoshua02) for their help with 0.4.0 release!


##Heres how it works:

1. Set up a test config file: specify screen sizes and DOM selectors.
2. Use BackstopJS to create reference screenshots.
3. Make some changes to your CSS or add new DOM components.
4. Run a test. BackstopJS creates a set of *test* screenshots and any changes show up in a nice report.


##Backstory:
BackstopJS is basically a wrapper around the very fabulous [Resemble.js](https://github.com/Huddle/Resemble.js) component written by [James Cryer](https://github.com/jamescryer). Other implementations of Resemble.js, namely [PhantomCSS](https://github.com/Huddle/PhantomCSS) require writing long form [CasperJS](http://casperjs.org) tests. This is of course great for testing complex UI interactions – but kind of cumbersome for more simple applications like static CMS templates or other higher level sanity testing.

BackstopJS may be just the thing if you develop custom Wordpress, Drupal or other CMS templates.  Tested on OSX.

BackstopJS was created by [Garris Shipon](expanded.me) at [Art.com labs](www.art.com).

<strong><a href="https://twitter.com/garris" class="twitter-follow-button" data-show-count="false">Follow @garris</a></strong>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>



...


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


`genConfig` will put `backstop.json` at the project root.


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
      "delay": 500
    }
  ]
}
```




**DEV NOTE:** If `./backstop.json` is not present at the project root then BackstopJS will fallback to use the following config at... `./node_modules/backstopjs/capture/config.default.json`



## Usage Notes

### generating (or updating) reference bitmaps 

    $ gulp reference


This task will create a (or update an existing) `bitmaps_reference` directory with screen captures from the current project build.



### generating test bitmaps

    $ gulp test

This task will create a new set of bitmaps in `bitmaps_test/<timestamp>/`
 
Once the test bitmaps are generated, a report comparing the most recent test bitmaps against the current reference bitmaps will run. Significant differences will be detected and shown. 



### testing SPAs and AJAX content

It is very common for client-side web apps is to initially download a small chunk of important content and render it to the screen as soon as it arrives at the browser. Once this has completed, various JS components often take over to progressively load more, less important content (e.g. ads, feeds or other supporting content/features) over some relatively short amount of time.

The problem testing these apps is knowing _when_ to take the screenshot.  BackstopJS solves this problem with two config properties: `readyEvent` and `delay`.

####trigger screen capture via console.log()

The `readyEvent` property enables you to trigger the screen capture by logging a predefined string to the console. For example, the following line will delay screen capture until your web app calls `console.log("backstopjs_ready")`...

    "readyEvent": "backstopjs_ready"

In the above case it would be up to you to wait for all dependencies to complete before calling logging `"backstopjs_ready"` string to the console.


####delay screen capture

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

### dealing with dynamic content

For obvious reasons, this screenshot approach is not optimal for testing live dynamic content. The best way to test a dynamic app would be to use a known static content data stub – or ideally many content stubs of varying lengths which, regardless of input length, should produce certain specific bitmap output.

####hiding selectors

That said, for a use case where you are testing a DOM with say an ad banner or a block of dynamic content which retains static dimensions, we have the `hideSelectors` property in `capture/config.json` which will set the corresponding DOM to `visibility:hidden`, thus hiding the content from our Resemble.js analysis but retaining the original layout flow.

    "hideSelectors": [
    	"#someFixedSizeDomSelector"
    ]

####removing selectors
There may also be elements which need to be completely removed during testing. For that we have `removeSelectors` which sets elements to `display:none`.

    "removeSelectors": [
    	"#someUnpredictableSizedDomSelector"
    ]


### troubleshooting

BackstopJS is fairly bare bones and there is not much in the way of guardrails to recover from things like an invalid config or a file not found. If something goes wrong it generally manifests in casperJS complaining about a missing selector.  If this happens you have the option of sending the configured URL(s) file contents to the console. From there you can at least verify that PhantomJS is indeed making a successful file request (and receiving the correct file back too.)

From `./node_modules/backstopjs` ...

    $ gulp echo


### running the report server

The test comparison report was written in Angular.js and requires a running HTTP server instance.  This instance is auto-started after a test is run.  The server is also auto-stopped after 15 minutes so you don't have to go worrying about bloaty node processes running all over the place.

To manually start the server, from `./node_modules/backstopjs` ...

    $ gulp start

...and to manually stop there is, from `./node_modules/backstopjs` ...

    $ gulp stop





**fin.**
