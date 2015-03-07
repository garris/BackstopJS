BackstopJS: Visual Regression Testing
==========================
Setting up visual regression testing framework with backstopjs.

## Setup

Install NodeJS framework and following packages.


 * Gulp

         $ npm install -g gulp

* CasperJS

         $ npm install -g casperjs


* PhantomJS  

         $ npm install -g phanomjs


## Usage

### Install Node packages from package.json

        $ npm install



This will create 'node_modules/backstopjs' directory. Now cd into that directory and install node dependencies

        $ cd node_modules/backstopJS
        $ npm install

Now we have to run gulp tasks to create references and compare the image difference.


       $ gulp reference

This will generate base images to compare against. The images will be in the 'node_modules/backstopjs/bitmaps_reference' directory

      $ gulp test

This will test latest screenshots against the refence screnshots.The newly created images will be  in the 'node_modules/backstopjs/bitmaps_test' directory

Once it finishes test. Google chrome will pop up with result.



# Running from Node modules

Run everything from the base of the project

      $ npm install

This will create 'node_modules/backstopjs' directory. Now cd into that directory and install node dependencies

              $ cd node_modules/backstopJS
              $ npm install

              $./node_modules/.bin/gulp reference

              $./node_modules/.bin/gulp test
