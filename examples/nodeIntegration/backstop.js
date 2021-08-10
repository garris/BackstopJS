const _ = require('lodash');
const fs = require('fs');
const args = require('yargs').argv;
const projectPath = `public/${args.p}`;
const backstop = require('backstopjs');

const filesToIgnore = {
  'first-project': [
    'ignore-me.html'
  ],
  'second-project': [
    'ignore-me.html'
  ],
  'third-project': [
    'ignore-me.html'
  ]
};

const projectConfig = require('./backstop.config.js')({
  'project': args.p,
  'scenarios': getScenariosForProject(projectPath)
});

let commandToRun = '';

if (args.reference) {
  commandToRun = 'reference';
}

if (args.test) {
  commandToRun = 'test';
}

if (args.openReport) {
  commandToRun = 'openReport';
}

if (commandToRun !== '') {
  backstop(commandToRun, { config: projectConfig });
}

function getScenariosForProject (projectPath) {
  const files = fs.readdirSync(projectPath);

  let scenarios;

  _.remove(files, isFileToIgnore);

  scenarios = files.map(file => {
    const scenarioLabel = file.split('.')[0].split('-').join(' ');

    return {
      'label': scenarioLabel,
      'url': `http://localhost:8000/${projectPath}/${file}`,
      'delay': 500,
      'misMatchThreshold': 0.1
    };
  });

  return scenarios;
}

function isFileToIgnore (file) {
  let shouldBeRemoved = false;

  // make sure we only have html files
  if (file.indexOf('.html') === -1) {
    shouldBeRemoved = true;
  }

  // exclude files by name
  if (filesToIgnore[args.p] && filesToIgnore[args.p].indexOf(file) > -1) {
    shouldBeRemoved = true;
  }

  return shouldBeRemoved;
}
