// * Setup for mongoDB
const mongoose = require('mongoose');
const config = require('config');
const winston = require('winston');

module.exports = () => {
  const db = config.get('dbConfig');
  mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => winston.info(`2/6 Connected to ${db}...`));
};
