const Sequelize = require('sequelize');

const sequelize = require('../../../startup/db');

const Family = sequelize.define(
  'subfamily',
  {
    // attributes
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    // options
  },
);

module.exports = Family;
