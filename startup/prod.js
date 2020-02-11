// * Packages for production environment

const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');

module.exports = app => {
  app.use(helmet());
  app.use(compression());
  winston.info('6/6 Set up Production packages.');
};
