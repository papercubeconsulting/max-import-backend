/* eslint-disable global-require */
const express = require('express');
const morgan = require('morgan');

const app = express();

require('./startup/config')();
require('./startup/logging')();
require('./startup/middleware')(app);

if (process.env.NODE_ENV === 'production') {
  require('./startup/prod')(app);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

const sequelize = require('./startup/db');

// sequelize.sync({ force: true });
sequelize.sync();

module.exports = app;
