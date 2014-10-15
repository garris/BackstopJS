BackstopJS
==========

**Catch CSS curve balls.**


*PROJECT COMING OCT 17th!*

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




##Usage

### generating (or updating) reference bitmaps

run `$ gulp reference`

This task will create a (or update an existing) `bitmaps_reference` directory with screen captures from the current project build.


### generating test bitmaps

run `$ gulp test`

This task will create a new set of bitmaps in `bitmaps_test/<timestamp>/`.  

Once the test bitmaps are generated, a report comparing the most recent test bitmaps against the current reference bitmaps will run. Significant differences will be detected and shown. 
