/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const Product = require('../product/productModel');
const Warehouse = require('../warehouse/warehouseModel');
const { Supply, SuppliedProduct } = require('../supply/supplyModel');

const ProductBox = sequelize.define(
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

ProductBox.belogsTo(Product);
Product.hasMany(ProductBox);

ProductBox.belogsTo(Warehouse);
Warehouse.hasMany(ProductBox);

ProductBox.belogsTo(Supply);
Supply.hasMany(ProductBox);

ProductBox.belogsTo(SuppliedProduct);
SuppliedProduct.hasMany(ProductBox);

module.exports = ProductBox;
