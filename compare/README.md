HTML report resource bundle
====

This directory contains the source files for the BackstopJS report UI.

To build the React project run...

```
npm run build-compare
``` 

This will generate `/compare/output/index_bundle.js`.

`/compare/output/index_bundle.js` contains all styles and js for the HTML report.  In normal BackstopJS operation this file bundle will be copied into the correct HTML report directory during a test flow (e.g. when running `backstop test`) after bitmap generation has completed.  See: `/core/command/report.js` writeBrowserReport() method for details on this mechanism.

Note: The files `diverged.js` & `diff.js` are copied from `node_modules` to `/compare/output/` during build.
