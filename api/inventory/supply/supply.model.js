/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');

const sequelize = require(`@root/startup/db`);

const { Product } = require('../product/product.model');
const { Provider } = require('../provider/provider.model');
const { Warehouse } = require('../warehouse/warehouse.model');

const { supplyStatus: status } = require('../../utils/constants');

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
    cancellationDate: {
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
    maxIndexSupplied: {
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

Warehouse.hasMany(Supply);
Supply.belongsTo(Warehouse);

Supply.SuppliedProducts = Supply.hasMany(SuppliedProduct);
SuppliedProduct.Supply = SuppliedProduct.belongsTo(Supply);

Product.hasMany(SuppliedProduct);
SuppliedProduct.Product = SuppliedProduct.belongsTo(Product);

Provider.hasMany(Supply);
Supply.belongsTo(Provider);

module.exports = { Supply, SuppliedProduct };
