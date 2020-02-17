/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const Warehouse = sequelize.define(
  'warehouse',
  {
    // attributes
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  },
  {
    // options
  },
);

module.exports = Warehouse;
