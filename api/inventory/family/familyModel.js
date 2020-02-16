/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const Family = sequelize.define(
  'family',
  {
    // attributes
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    // options
  },
);

module.exports = Family;
