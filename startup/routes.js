/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
const express = require('express');
const cors = require('cors');
const path = require('path');
const winston = require('winston');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const celebrateError = require('../api/middleware/celebrateError');
const error = require('../api/middleware/error');

// Routers for applications
const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
const InventoryRouter = require('../api/inventory/inventoryRoutes');
const openApiDocumentation = YAML.load(
  path.join(__dirname, '../config/openApiDocumentation.yaml'),
);

module.exports = app => {
  app.options('*', cors()); // Update according to project
  app.use(cors());

  app.use(
    express.urlencoded({
      extended: false,
    }),
  );
  app.use(express.static(path.join(__dirname, '../public')));

  app.use(
    express.json({
      verify(req, res, buf, encoding) {
        req.rawBody = buf.toString();
      },
    }),
  );

  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/', InventoryRouter);

  app.use('/apiDocs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

  app.use(celebrateError);
  app.use(error);

  winston.info('4/4 Setup router and middlewares');
};
