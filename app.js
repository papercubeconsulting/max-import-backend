/* eslint-disable global-require */
const express = require('express');
const morgan = require('morgan');
require('module-alias/register');

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

const db = require('./startup/db');

db.sequelize.sync();

// const sequelize = require('./startup/db');

// sequelize.sync({ force: true });

module.exports = app;
