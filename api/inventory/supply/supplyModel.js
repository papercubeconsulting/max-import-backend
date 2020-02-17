/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');

const sequelize = require('../../../startup/db');

const Product = require('../product/productModel');

const Supply = sequelize.define(
  'supply',
  {
    // attributes
    provider: {
      type: Sequelize.STRING,
    },
    code: {
      type: Sequelize.STRING,
    },
    attentionDate: {
      type: Sequelize.DATE,
    },
    observations: {
      type: Sequelize.TEXT,
    },
    status: {
      type: Sequelize.ENUM(['Pendiente', 'Atendido', 'Cancelado']),
      defaultValue: 'Pendiente',
    },
  },
  {
    // options
  },
);

const SuppliedProduct = sequelize.define(
  'suppliedProduct',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: {
      type: Sequelize.INTEGER,
    },
    suppliedQuantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    boxSize: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.ENUM(['Pendiente', 'Atendido', 'Cancelado']),
      defaultValue: 'Pendiente',
    },
  },
  {
    // options
  },
);

Product.belongsToMany(Supply, { through: SuppliedProduct });
Supply.belongsToMany(Product, { through: SuppliedProduct });

module.exports = { Supply, SuppliedProduct };
