/* eslint-disable no-param-reassign */
/* eslint-disable object-shorthand */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const Product = require('../product/productModel');
const Warehouse = require('../warehouse/warehouseModel');
const { Supply, SuppliedProduct } = require('../supply/supplyModel');

const ProductBox = sequelize.define(
  'productBox',
  {
    // attributes
    indexFromSupliedProduct: {
      type: Sequelize.INTEGER,
    },
    trackingCode: {
      type: Sequelize.STRING,
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
    indexes: [
      {
        unique: true,
        fields: ['suppliedProductId', 'indexFromSupliedProduct'],
      },
    ],
  },
);

ProductBox.prototype.getTrackingCode = function() {
  return `${this.suppliedProductId}-${this.productId}-${this.indexFromSupliedProduct}`;
};

ProductBox.afterCreate('generateCode', async (productBox, options) => {
  productBox.trackingCode = productBox.getTrackingCode();
  await productBox.save({ transaction: options.transaction });
});

ProductBox.beforeBulkCreate('generateCode', async (productBoxes, options) => {
  productBoxes.forEach(
    (obj, index, array) =>
      (array[index].trackingCode = array[index].getTrackingCode()),
  );
  // productBox.trackingCode = productBox.getTrackingCode();
  // await productBox.save({ transaction: options.transaction });
});

ProductBox.belongsTo(Product);
Product.hasMany(ProductBox);

ProductBox.belongsTo(Warehouse);
Warehouse.hasMany(ProductBox);

ProductBox.belongsTo(Supply);
Supply.hasMany(ProductBox);

ProductBox.belongsTo(SuppliedProduct);
SuppliedProduct.hasMany(ProductBox);

module.exports = ProductBox;
