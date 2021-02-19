/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
/* eslint-disable func-names */
const express = require('express');
const cors = require('cors');
const path = require('path');
const winston = require('winston');

const celebrateError = require('../api/middleware/celebrateError');
const error = require('../api/middleware/error');

const { initialiseAuthentication } = require('@/middleware/authentication');

// Routers for applications

module.exports = app => {
  app.options('*', cors()); // Update according to project
  app.use(cors());

  app.use(
    express.urlencoded({
      extended: false,
      limit: '30mb',
    }),
  );
  app.use(express.static(path.join(__dirname, '../public')));

  app.use(
    express.json({
      limit: '30mb',
      verify(req, res, buf, encoding) {
        req.rawBody = buf.toString();
      },
    }),
  );

  require('./documentation')(app);

  // * Include application routers

  initialiseAuthentication(app);
  require('./routes')(app);

  app.use(celebrateError);
  app.use(error);

  winston.info('4/4 Setup router and middlewares');
};
