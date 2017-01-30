# NodeJS example

We have 3 separate projects in the `public` folder: `first-project`, `second-project` and `third-project`. They all have the same structure and for the sake of easiness, they are extremely simple.

Our job is to ask BackstopJS to test all (or some) of the files in any project we want using the same config file and generate the `scenarios` on-the-fly.

## Prerequisites
1. `cd path/to/examples/nodeIntegration`
2. `npm install`
3. `node server.js`
4. Verify that the page loads by browsing `http://localhost:8000/public/second-project/`. If it doesn't load for you, please debug :)

## Importing a config file and passing it some parameters

Make sure you have done the Prerequisites part above and you have Koa serving the `public` folder.

Then in a new console window `cd` into `nodeIntegration` and run

```
node backstop.js --reference -p second-project
```

This will generate the reference files for the `second-project` under the `backstop_data/second-project` folder for you.

Run

```
node backstop.js --test -p second-project
```

to test. It should pass :)

Use `--reference`, `--test` and `--openReport` to specify which BackstopJS command you need to run. Use `-p` to specify the project folder you'd like to test.

Thus we are able to use _one_ config for _all_ the projects that need the same config. You can test this by changing the `-p` parameter.

##### NB
Project root folders sometimes contain files that should not be tested (e.g. `package.json`), or other files we'd like not to test. Since we generate the scenarios automatically using `fs.readdirSync`, we'll need to filter the results.

Please take a look at the `filesToIgnore` constant in the `backstop.js` file where we specify the files to ignore and the `isFileToIgnore` function that does the filtering. In this example I use `lodash` to get the needed result.

This is why when you test the `second-project`, you get only 2 tests, the `ignore-me.html` and `dummy.json` files are ignored.
