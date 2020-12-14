/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('config');
const winston = require('winston');

const db = {};

const sequelize = new Sequelize(config.get('dbConfig'), {
  // logging: process.env.NODE_ENV !== 'production' ? console.log : null,
  logging: false ? console.log : null,
});

function recFindByExt(base, ext, files, result) {
  files = files || fs.readdirSync(base);
  result = result || [];

  files.forEach(function(file) {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result);
    } else if (file.substr(-1 * (ext.length + 1)) === `.${ext}`) {
      result.push(newbase);
    }
  });
  return result;
}

const capitalize = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

recFindByExt(path.join('./api'), 'model.js')
  .filter(file => {
    return file.indexOf('.') !== 0 && file.slice(-3) === '.js';
  })
  .forEach(file => {
    const model = require(path.join('../', file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[capitalize(model.name)] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

winston.info('Step X: Connection has been established successfully.');

module.exports = db;
