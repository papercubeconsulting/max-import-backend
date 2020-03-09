/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const Provider = sequelize.define(
  'provider',
  {
    // attributes
    qrCode: {
      type: Sequelize.INTEGER,
    },
    boxSize: {
      type: Sequelize.INTEGER,
    },
    stock: {
      type: Sequelize.INTEGER,
    },
    damagedStock: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    isAvailable: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    // options
  },
);

module.exports = Provider;
