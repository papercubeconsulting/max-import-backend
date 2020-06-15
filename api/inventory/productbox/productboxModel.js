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

// ? Al momento de crear
// ? Al momento de mover
const ProductBoxLog = sequelize.define(
  'productBoxLog',
  {
    // attributes
    log: { type: Sequelize.STRING },
    user: { type: Sequelize.INTEGER }, // TODO: Retirar al añadir dependencia a usuario
  },
  {
    // options
  },
);

function pad(n, width, z) {
  z = z || '0';
  n += '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

ProductBox.prototype.getTrackingCode = function() {
  return `${pad(this.productId, 6)}${pad(this.supplyId, 6)}${pad(
    this.suppliedProductId,
    6,
  )}${pad(this.indexFromSupliedProduct, 6)}`;
};

ProductBox.beforeCreate('generateCode', async (productBox, options) => {
  productBox.trackingCode = productBox.getTrackingCode();
});

ProductBox.beforeBulkCreate('generateCode', async (productBoxes, options) => {
  productBoxes.forEach(
    (obj, index, array) =>
      (array[index].trackingCode = array[index].getTrackingCode()),
  );
});

ProductBox.prototype.registerLog = function(message, user) {
  ProductBoxLog.create({
    productBoxId: this.id,
    log: message,
    user: user.id,
    warehouseId: this.warehouseId,
  });
};

ProductBox.bulkRegisterLog = function(message, user, data) {
  ProductBoxLog.bulkCreate(
    data.map(productBox => ({
      productBoxId: productBox.id,
      log: message,
      user: user.id,
      warehouseId: productBox.warehouseId,
    })),
  );
};

// TODO: Agregar dependencia a User

ProductBoxLog.belongsTo(ProductBox);
ProductBox.hasMany(ProductBoxLog);

ProductBoxLog.belongsTo(Warehouse);
Warehouse.hasMany(ProductBoxLog);

ProductBox.belongsTo(Product);
Product.hasMany(ProductBox);

ProductBox.belongsTo(Warehouse);
Warehouse.hasMany(ProductBox);

ProductBox.belongsTo(Supply);
Supply.hasMany(ProductBox);

ProductBox.belongsTo(SuppliedProduct);
SuppliedProduct.hasMany(ProductBox);

module.exports = { ProductBox, ProductBoxLog };
