const express = require('express');
const logger = require('@profilepensions/logger');
const mongoose = require('mongoose');
const healthcheck = require('@profilepensions/express-healthcheck');
const mongoErrorHandler = require('@profilepensions/mongo-error-handler');
const bodyParser = require('body-parser');
const prometheusMiddleware = require('express-prometheus-middleware');
// const Database = require('./db');

// const log = require('./utils/logWithReqId');
const { attachContext, setRequestId } = require('./utils/context');

const index = require('./routes/index');

const app = express();
// Database.connect();

app.use(logger.requestLog);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/_/health', healthcheck({
  mongodb: {
    connection: mongoose.connection,
    critical: false,
  },
}));

app.use(prometheusMiddleware({
  extraMasks: [
    /\w+(-\w*)+.(pdf|zip)/, // Filenames
    /\w+(\.\w+)+@\w+(.\w+)+/, // Email addresses
  ],
}));

// set up context for and request ids for logging cls-hooked
app.use(attachContext, setRequestId);

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use('/', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).send(JSON.stringify({ error: 'The body of your request is not valid json' }));
  }
  return next(err);
});

app.use(mongoErrorHandler);

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
