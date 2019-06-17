/* eslint no-console: off */
'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var backstop = require('../core/runner');
var PATH_TO_CONFIG = path.resolve(process.cwd(), 'backstop');
var _config = require(PATH_TO_CONFIG);

module.exports = function (app) {
    app._backstop = app._backstop || {};
    app._backstop.testCtr = 0;
    app._backstop.tests = {};

    app.use(express.json({limit: '2mb'})); // support json encoded bodies
    app.use(express.urlencoded({ extended: true, limit: '2mb' })); // support encoded bodies

    //Handle non-transparent proxy calls from testem (ember compatibility)
    app.use(function(req, res, next) {
       req.url = req.url
         .replace(/\/backstop\/backstop_data/,'/backstop_data')
         .replace(/\/backstop\/dview/,'/dview')
         .replace(/\/backstop\/dtest/,'/dtest');
       next();
    });

    app.post('/dtest/:testId/:scenarioId', (req, res) => {
      app._backstop.testCtr++;

      if (!req.params.testId in app._backstop.tests) {
        app._backstop.tests[req.params.testId] = {};
      }
      app._backstop.tests[req.params.testId] = {[req.params.scenarioId]: req.body};

      console.log('Processing dynamic test request for ', `dview/${req.params.testId}/${req.params.scenarioId} `, app._backstop.testCtr);
      console.log('Loadinfg dynamic config template at ' + PATH_TO_CONFIG);

      var config = JSON.parse(JSON.stringify(_config))
      config.dynamicTestId = req.params.testId;
      var s = config.scenarios[0];
      s.label = req.body.name;
      s.url = s.url
        .replace(/{origin}/, req.body.origin)
        .replace(/{testId}/, req.params.testId)
        .replace(/{scenarioId}/, req.params.scenarioId);
      
      var result = {
        label: s.label,
        surl: s.url,
        testId: req.params.testId, 
        scenarioId: req.params.scenarioId, 
        vid: app._backstop.testCtr
      };

      backstop('test', {config}).then(
        () => {
          result.ok = true;
          res.send(JSON.stringify(result))
        },
        () => {
          result.ok = false;
          res.send(JSON.stringify(result))
        }
      )
    });
    
    app.get('/dview/:testId/:scenarioId', (req, res) => {
      console.log('Dynamic view request for ' + req.params.testId, req.params.scenarioId);
      try {
        res.send(app._backstop.tests[req.params.testId][req.params.scenarioId].content);
      } catch (err) {
        console.log(err);
        res.send(`${req.params.testId} ${req.params.scenarioId}` + err);
      }
    });
    
    app.get('/approve', async (req, res) => {
      const filter = req.query.filter || '';
      const config = JSON.parse(JSON.stringify(_config))
      console.log(`backstop approve --filter=${filter}`);
      try {
        await backstop('approve', {
          config,
          filter: filter
        });
        res.send('OK ' + req.query.filter);
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