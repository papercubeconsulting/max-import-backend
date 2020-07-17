// * Setup for Sequalize
const Sequelize = require('sequelize');
const config = require('config');
const winston = require('winston');
//change connection only for testing purpose
const sequelize = new Sequelize(
  'postgres://fnmfiuki:pNv0tLjXjM2LlSdSdfrDx0yK3RZjAMN1@rajje.db.elephantsql.com:5432/fnmfiuki',
  {
    logging: process.env.NODE_ENV !== 'production' ? console.log : null,
    // logging: false ? console.log : null,
  },
);

sequelize
  .authenticate()
  .then(() => {
    winston.info('2/4 Connection has been established successfully.');
  })
  .catch(err => {
    winston.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
