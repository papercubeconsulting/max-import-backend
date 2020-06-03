/* eslint-disable no-param-reassign */
/* eslint-disable object-shorthand */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const { Product } = require('../product/productModel');
const { Warehouse } = require('../warehouse/warehouseModel');
const { Supply, SuppliedProduct } = require('../supply/supplyModel');

const ProductBox = sequelize.define(
  'productBox',
  {
    // attributes
    indexFromSupliedProduct: {
      // ? Correlativo asociado a supply
      type: Sequelize.INTEGER,
    },
    trackingCode: {
      // ? Codigo de seguimiento
      type: Sequelize.STRING,
    },
    boxSize: {
      // ? Tamano de la caja - Cantidad original de productos
      type: Sequelize.INTEGER,
    },
    stock: {
      // ? Cantidad actual de productos
      type: Sequelize.INTEGER,
    },
    isAvailable: {
      // ? Indica si existen productos disponibles | stock === 0
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
      {
        fields: ['trackingCode'],
      },
    ],
  },
);

const ProductBoxLog = sequelize.define(
  'productBoxLog',
  {
    // attributes
    userName: { type: Sequelize.STRING },
    location: { type: Sequelize.STRING },
    log: { type: Sequelize.STRING },
  },
  {
    // options
  },
);

ProductBox.prototype.getTrackingCode = function() {
  return `${this.productId}-${this.supplyId}-${this.suppliedProductId}-${this.indexFromSupliedProduct}`;
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

module.exports = { ProductBox };
