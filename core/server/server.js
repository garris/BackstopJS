'use strict';

var express = require('express');
var config = require('./config/config');
var routes = require('./routes/index');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

routes(app);

app.listen(config.PORT, function () {
  console.log(`Server listening on port ${config.PORT}`);
});
