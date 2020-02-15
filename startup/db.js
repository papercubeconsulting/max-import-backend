// * Setup for Sequalize
const Sequelize = require('sequelize');
const config = require('config');
const winston = require('winston');

const sequelize = new Sequelize(config.get('dbConfig'), {
  logging: process.env.NODE_ENV !== 'production' ? console.log : null,
});

sequelize
  .authenticate()
  .then(() => {
    winston.info('2/4 Connection has been established successfully.');
  })
  .catch(err => {
    winston.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
