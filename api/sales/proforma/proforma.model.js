/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');
const _ = require('lodash');

const sequelize = require(`${process.cwd()}/startup/db`);

const { User } = require('../../auth/user/user.model');
const { Client } = require('../../management/client/client.model');
const { Product } = require('../../inventory/product/product.model');
const { Sale, SoldProduct } = require('../sale/sale.model');

const { getDictValues, PROFORMA } = require('../../utils/constants');

// ? Tabla PROFORMA - Relaciones
// ? Usuario >-
// ? Cliente >-
// ? ProformaProduct >- M2M a Producto
// ? Venta --

const Proforma = sequelize.define(
  'proforma',
  {
    // attributes
    status: {
      type: Sequelize.ENUM(getDictValues(PROFORMA.STATUS)),
      defaultValue: PROFORMA.STATUS.OPEN.value,
    },
    saleStatus: {
      type: Sequelize.ENUM(getDictValues(PROFORMA.SALE_STATUS)),
      defaultValue: PROFORMA.SALE_STATUS.PENDING.value,
    },
    dispatchStatus: {
      type: Sequelize.ENUM(getDictValues(PROFORMA.DISPATCH_STATUS)),
      defaultValue: PROFORMA.DISPATCH_STATUS.PENDING.value,
    },
    // ? Suma de los subtotales de cada elemento de la proforma
    subtotal: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    // ? Monto de descuento aplicado a toda la proforma
    discount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    // ? Diferencia entre subtotal y discount
    total: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    // ? Monto pagado por adelantado
    credit: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    // ? Cantidad total de unidades
    totalUnits: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },

    // * Virtual fields

    statusDescription: {
      type: Sequelize.DataTypes.VIRTUAL,
      get() {
        return PROFORMA.STATUS[this.status].name;
      },
    },
    saleStatusDescription: {
      type: Sequelize.DataTypes.VIRTUAL,
      get() {
        return PROFORMA.SALE_STATUS[this.saleStatus].name;
      },
    },
    dispatchStatusDescription: {
      type: Sequelize.DataTypes.VIRTUAL,
      get() {
        return PROFORMA.DISPATCH_STATUS[this.dispatchStatus].name;
      },
    },
    discountPercentage: {
      type: Sequelize.DataTypes.VIRTUAL,
      get() {
        return _.round(this.discount / this.subtotal, 2);
      },
    },
  },
  {
    // options
  },
);

// ? Tabla PROFORMAPRODUCT - Relaciones
// ? Proforma -< Tabla intermedia
// ? Product >-
// ?

const ProformaProduct = sequelize.define(
  'proformaProduct',
  {
    // attributes
    quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    unitPrice: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    subtotal: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    // options
    indexes: [
      {
        unique: true,
        fields: ['productId', 'proformaId'],
      },
    ],
  },
);

Proforma.beforeUpdate('calculatePrices', async proforma => {
  if (proforma.proformaProducts) {
    proforma.subtotal = proforma.proformaProducts.reduce(
      (a, b) => a + b.subtotal,
      0,
    );
    proforma.totalUnits = proforma.proformaProducts.reduce(
      (a, b) => a + b.quantity,
      0,
    );
  }
  proforma.total = proforma.subtotal - proforma.discount;
});

ProformaProduct.beforeValidate('calculatePrices', async proformaProduct => {
  proformaProduct.subtotal =
    proformaProduct.quantity * proformaProduct.unitPrice;
});

// ? Se valida que NO haya un producto cuya cantidad exceda el stock
Proforma.prototype.checkStock = async function(options) {
  return !(
    await this.getProformaProducts({
      attributes: ['productId', 'quantity'],
      include: [{ model: Product, attributes: ['availableStock'] }],
      ...options,
    })
  ).some(obj => obj.quantity > obj.product.availableStock);
};

Proforma.prototype.closeProforma = async function(saleBody, options) {
  // ? Se obtiene los productos a vender
  const soldProducts = await this.getProformaProducts({
    attributes: ['productId', 'quantity'],
    ...options,
  });
  // ? Se crea la nueva venta, incluyendo la data de los productos vendidos
  const sale = await this.createSale(
    { ...saleBody, soldProducts },
    { include: [SoldProduct], ...options },
  );

  // TODO:
  // await Product.updateStock([])

  // ? Se actualiza los estados de la proforma y el estado contable
  this.status = PROFORMA.STATUS.CLOSED.value;

  // ? En caso sea pago con deuda, el estado de la proforma sera PARTIAL
  // ? En caso sea pago compelto, el estado de la proforma sera PAID
  this.saleStatus = PROFORMA.MAP_SALE_STATUS[sale.status];

  await this.save({ ...options });
};

User.hasMany(Proforma);
Proforma.belongsTo(User);

Client.hasMany(Proforma);
Proforma.belongsTo(Client);

Proforma.ProformaProducts = Proforma.hasMany(ProformaProduct);
ProformaProduct.Proforma = ProformaProduct.belongsTo(Proforma);

Product.hasMany(ProformaProduct);
ProformaProduct.Product = ProformaProduct.belongsTo(Product);

Proforma.hasOne(Sale);
Sale.belongsTo(Proforma);

module.exports = { Proforma, ProformaProduct };
