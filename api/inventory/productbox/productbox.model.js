/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable object-shorthand */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');
const _ = require('lodash');

const { Op } = Sequelize;

const sequelize = require(`@root/startup/db`);

const { User } = require('@/auth/user/user.model');
const { Product } = require('../product/product.model');
const { Warehouse } = require('../warehouse/warehouse.model');
const { Supply, SuppliedProduct } = require('../supply/supply.model');
const { PRODUCTBOX_UPDATES, warehouseTypes } = require('@/utils/constants');

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
  return `1${pad(this.supplyId, 6)}${pad(this.suppliedProductId, 6)}${pad(
    this.indexFromSupliedProduct,
    3,
  )}`;
};

ProductBox.beforeCreate('generateCode', async (productBox, options) => {
  productBox.trackingCode = productBox.getTrackingCode();
});

ProductBox.beforeBulkCreate('generateCode', async (productBoxes, options) => {
  productBoxes.forEach((obj, index, array) => {
    array[index].trackingCode = array[index].getTrackingCode();
  });
});

ProductBox.prototype.registerLog = function(message, user) {
  ProductBoxLog.create({
    productBoxId: this.id,
    log: _.get(PRODUCTBOX_UPDATES, `${message}.name`, message),
    userId: user.id,
    warehouseId: this.warehouseId,
  });
};

ProductBox.bulkRegisterLog = function(message, user, data) {
  ProductBoxLog.bulkCreate(
    data.map(productBox => ({
      productBoxId: productBox.id,
      log: _.get(PRODUCTBOX_UPDATES, `${message}.name`, message),
      userId: user.id,
      warehouseId: productBox.warehouseId,
    })),
  );
};

Product.updateStock = async (id, options) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: ProductBox,
        where: { stock: { [Op.gt]: 0 } },
        attributes: ['id', 'stock', 'boxSize'],
        include: [
          {
            model: Warehouse,
            attributes: ['type', 'id', 'name'],
          },
        ],
        required: false,
      },
      {
        model: sequelize.models.soldProduct,
      },
    ],
    transaction: options.transaction,
  });
  if (!product) return;
  const summary = Product.aggregateStock(product.get());
  const damagedStock = _.get(
    summary.stockByWarehouseType.find(
      obj => obj.warehouseType === warehouseTypes.DAMAGED,
    ),
    'stock',
    0,
  );
  // ? Unidades vendidas
  const soldStock = product.soldProducts.reduce(
    (acum, curr) => acum + curr.quantity,
    0,
  );
  // ? Unidades despachadas
  // TODO: Calcular cuando se implemente despacho
  const dispatchedStock = 0;

  await product.update(
    {
      damagedStock,
      availableStock:
        summary.totalStock - damagedStock - (soldStock - dispatchedStock),
    },
    { transaction: options.transaction },
  );
};

ProductBoxLog.belongsTo(User);
User.hasMany(ProductBoxLog);

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
