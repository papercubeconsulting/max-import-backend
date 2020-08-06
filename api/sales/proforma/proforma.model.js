/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');
const _ = require('lodash');

const sequelize = require(`${process.cwd()}/startup/db`);

const { User } = require('../../auth/user/userModel');
const { Client } = require('../../management/client/client.model');
const { Product } = require('../../inventory/product/productModel');

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

Proforma.beforeUpdate('calculatePrices', async (proforma, options) => {
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

ProformaProduct.beforeValidate(
  'calculatePrices',
  async (proformaProduct, options) => {
    proformaProduct.subtotal =
      proformaProduct.quantity * proformaProduct.quantity;
  },
);

User.hasMany(Proforma);
Proforma.belongsTo(User);

Client.hasMany(Proforma);
Proforma.belongsTo(Client);

Proforma.ProformaProducts = Proforma.hasMany(ProformaProduct);
ProformaProduct.Proforma = ProformaProduct.belongsTo(Proforma);

Product.hasMany(ProformaProduct);
ProformaProduct.Product = ProformaProduct.belongsTo(Product);

module.exports = { Proforma, ProformaProduct };
