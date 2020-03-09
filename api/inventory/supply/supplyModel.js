/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const Product = require('../product/productModel');
const Provider = require('../provider/providerModel');
const Warehouse = require('../warehouse/warehouseModel');

const { status } = require('../../utils/constants');

const statuses = [status.PENDING, status.CANCELLED, status.ATTENDED];

const Supply = sequelize.define(
  'supply',
  {
    // attributes
    code: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    attentionDate: {
      type: Sequelize.DATE,
    },
    observations: {
      type: Sequelize.TEXT,
    },
    status: {
      type: Sequelize.ENUM(statuses),
      defaultValue: status.PENDING,
    },
  },
  {
    // options
    paranoid: true,
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
      type: Sequelize.ENUM(statuses),
      defaultValue: status.PENDING,
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

SuppliedProduct.Supply = SuppliedProduct.belongsTo(Supply);
Supply.SuppliedProducts = Supply.hasMany(SuppliedProduct);

SuppliedProduct.Product = SuppliedProduct.belongsTo(Product);
Product.hasMany(SuppliedProduct);

module.exports = { Supply, SuppliedProduct };
