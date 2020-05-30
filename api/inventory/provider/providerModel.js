/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const Provider = sequelize.define(
  'provider',
  {
    // attributes
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: '',
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    // options
  },
);

module.exports = Provider;
