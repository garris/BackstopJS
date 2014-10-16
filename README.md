BackstopJS
==========

**Catch CSS curve balls.**


BackstopJS makes it easy to test your responsive web UI by visually comparing DOM screenshots at various viewport sizes.

**Heres the process:**

1. Set up a test config file: specify screen sizes and DOM selectors.
2. Create reference screenshots – these will be used to test future changes.
3. Make some changes to your CSS or add new DOM components.
4. Run a test. Any changes effecting your layout it will show up in the report!

**Backstory:** BackstopJS is basically a wrapper around the very fabulous [Resemble.js](https://github.com/Huddle/Resemble.js) component written by [James Cryer](https://github.com/jamescryer). Other implementations of Resemble.js, namely [PhantomCSS](https://github.com/Huddle/PhantomCSS) require writing long form [CasperJS](http://casperjs.org) tests. This is of course great for testing complex UI interactions – but kind of cumbersome for more simple applications like static CMS templates or other higher level sanity testing. 

BackstopJS may be just the thing if you develop custom Wordpress, Drupal or other CMS templates.  Or not, [Let me know what you think!](https://twitter.com/garris)

<a href="https://twitter.com/garris" class="twitter-follow-button" data-show-count="false">Follow @garris</a>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>






---



##Installation

**STEP 1. BackstopJS package.  see... http://backstopjs.org/**
    
    $ bower install backstopjs

**STEP 2. Global install of PhantomJS. see... http://phantomjs.org/download.html**

    $ npm install phantomjs

**STEP 3. Global install of CasperJS. see... http://docs.casperjs.org/en/latest/installation.html**
    
    $ npm install -g casperjs

**STEP 4. Install node server and tests.**

    $ npm install




##Configuration

see capture/config.json

    {
    
    	"viewports" : [
    		{
    		 "name": "phone",
    		 "viewport": {"width": 320, "height": 480}
    		}
    		,{
    		 "name": "tablet_v",
    		 "viewport": {"width": 568, "height": 1024}
    		}
    		,{
    		 "name": "tablet_h",
    		 "viewport": {"width": 1024, "height": 768}
    		}
    	]
    	,
    	"grabConfigs" : [
    		{
    			"testName":"http://getbootstrap.com"
    			,"url":"http://getbootstrap.com"
    			,"selectors":[
    				"header"
    				,"main"
    				,"body .bs-docs-featurette:nth-of-type(1)"
    				,"body .bs-docs-featurette:nth-of-type(2)"
    				,"footer"
    			]
    		}
    	]
    
    }
    


##Usage

### generating (or updating) reference bitmaps

    $ gulp reference

This task will create a (or update an existing) `bitmaps_reference` directory with screen captures from the current project build.


### generating test bitmaps

    $ gulp test

This task will create a new set of bitmaps in `bitmaps_test/<timestamp>/`.  

Once the test bitmaps are generated, a report comparing the most recent test bitmaps against the current reference bitmaps will run. Significant differences will be detected and shown. 
