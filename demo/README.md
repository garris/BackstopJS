BackstopJS: Visual Regression Testing
==========================
Setting up visual regression testing framework with backstopjs.

## Setup

Install NodeJS framework and following packages.

 * Bower

         $ npm install -g bower

 * Gulp

         $ npm install -g gulp

* CasperJS

         $ npm install -g casperjs


* PhantomJS  

         $ npm install -g phanomjs



## Usage

### Install Node packages from package.json

        $ npm install

### Install bower package for the 'backstopJS'

        $ bower install

This will create 'bower_components/backstopjs' directory. Now cd into that directory and install node dependencies

        $ cd bower_components/backstopJS
        $ npm install

Now we have to run gulp tasks to create references and compare the image difference.


       $ gulp reference

This will generate base images to compare against. The images will be in the 'bower_components/backstopjs/bitmaps_reference' directory

      $ gulp test

This will test latest screenshots against the refence screnshots.The newly created images will be  in the 'bower_components/backstopjs/bitmaps_test' directory

Once it finishes test. Google chrome will pop up with resluts.


### Gulp Chug

As backstopJS has it's own gulfile.js so it's hard to run gulp from base of the project. We have gulp file referencing backstopJS gulp
