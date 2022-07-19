/* eslint no-console: off */
'use strict';

const parseArgs = require('minimist');
const argsOptions = parseArgs(process.argv.slice(2), {
  string: ['config']
});
const PROJECT_PATH = argsOptions._[0];
const PATH_TO_CONFIG = argsOptions.config;
const _config = require(argsOptions.config);

const path = require('path');
const express = require('express');
const backstop = require('../core/runner');
const { modifyJsonpReport } = require('../core/util/remote');

const booleanizeArg = incrementalFlag => [true, 'true'].includes(incrementalFlag);

module.exports = function (app) {
  app._backstop = app._backstop || {};
  app._backstop.testCtr = 0;
  app._backstop.tests = {};

  app.use(express.json({ limit: '2mb' })); // support json encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '2mb' })); // support encoded bodies

  // Handle non-transparent proxy calls from testem (ember compatibility)
  app.use(function (req, res, next) {
    req.url = req.url
      .replace(/\/backstop\/backstop_data/, '/backstop_data')
      .replace(/\/backstop\/dview/, '/dview')
      .replace(/\/backstop\/dtest/, '/dtest');
    next();
  });

  app.post(['/dtest/:testId/:scenarioId', '/dref/:testId/:scenarioId'], (req, res) => {
    app._backstop.testCtr++;

    if (!(req.params.testId in app._backstop.tests)) {
      app._backstop.tests[req.params.testId] = {};
    }
    app._backstop.tests[req.params.testId] = {
      [req.params.scenarioId]: req.body
    };

    console.log(
      'Processing dynamic test request for ',
      `dview/${req.params.testId}/${req.params.scenarioId} `,
      app._backstop.testCtr
    );
    console.log('Loading dynamic config template at ' + PATH_TO_CONFIG);

    const config = JSON.parse(JSON.stringify(_config));
    config.dynamicTestId = req.params.testId;
    const s = Object.assign({}, config.scenarios[0], req.body.scenario);
    s.label = req.body.name;
    s.url = s.url
      .replace(/{origin}/, req.body.origin)
      .replace(/{testId}/, req.params.testId)
      .replace(/{scenarioId}/, req.params.scenarioId);
    config.scenarios[0] = s;

    const result = {
      label: s.label,
      surl: s.url,
      testId: req.params.testId,
      scenarioId: req.params.scenarioId,
      vid: app._backstop.testCtr
    };

    const command = req.path.includes('/dref/') ? 'reference' : 'test';
    backstop(command, { config, i: booleanizeArg(req.body.i) }).then(
      () => {
        result.ok = true;
        res.send(JSON.stringify(result));
      },
      () => {
        result.ok = false;
        res.send(JSON.stringify(result));
      }
    );
  });

  app.get('/dview/:testId/:scenarioId', (req, res) => {
    console.log(
      'Dynamic view request for ' + req.params.testId,
      req.params.scenarioId
    );
    try {
      res.send(
        app._backstop.tests[req.params.testId][req.params.scenarioId].content
      );
    } catch (err) {
      console.log(err);
      res.send(`${req.params.testId} ${req.params.scenarioId}` + err);
    }
  });

  app.post('/approve', async (req, res) => {
    const filter = req.query.filter || '';
    const config = JSON.parse(JSON.stringify(_config));
    console.log(`backstop approve --filter=${filter}`);

    try {
      await backstop('approve', {
        config,
        filter
      });

      const reportConfigFilename = path.join(
        _config.paths.html_report,
        'config.js'
      );
      await modifyJsonpReport({
        reportConfigFilename,
        approvedFileName: filter
      });

      res.send('OK ' + req.query.filter);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: error.message });
    }
  });

  app.post('/test', async (req, res) => {
    try {
      await backstop('test');
      res.send('OK');
    } catch (err) {
      console.log(err);
      res.send('FAILED ' + err);
    }
  });

  app.get('/stop', async (req, res) => {
    try {
      await backstop('stop');
      res.send('OK');
    } catch (err) {
      console.log(err);
      res.send('FAILED ' + err);
    }
  });

  app.get('/version', async (req, res) => {
    try {
      const version = await backstop('version');
      res.send('BackstopJS ' + version);
    } catch (err) {
      console.log(err);
      res.send('FAILED ' + err);
    }
  });
};
