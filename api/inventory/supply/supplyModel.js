/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');

const sequelize = require('../../../startup/db');

const Product = require('../product/productModel');
const Provider = require('../provider/providerModel');
const Warehouse = require('../warehouse/warehouseModel');

const Supply = sequelize.define(
  'supply',
  {
    // attributes
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
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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
    indexes: [
      {
        unique: true,
        fields: ['boxSize', 'productId', 'supplyId'],
      },
    ],
  },
);

Supply.belongsTo(Provider);
Provider.hasMany(Supply);

Supply.belongsTo(Warehouse);
Warehouse.hasMany(Supply);

SuppliedProduct.belongsTo(Supply);
Supply.hasMany(SuppliedProduct);

SuppliedProduct.belongsTo(Product);
Product.hasMany(SuppliedProduct);

module.exports = { Supply, SuppliedProduct };
