/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`@root/startup/db`);

const { warehouseTypes: types } = require('../../utils/constants');

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
    type: {
      type: Sequelize.ENUM([types.WAREHOUSE, types.STORE, types.DAMAGED]),
      defaultValue: types.WAREHOUSE,
    },
  },
  {
    // options
  },
);

module.exports = { Warehouse };
