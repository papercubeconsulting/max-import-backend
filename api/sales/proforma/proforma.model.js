/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

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
    subtotal: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    discount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    total: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    credit: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
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
  if (proforma.proformaProducts)
    proforma.subtotal = proforma.proformaProducts.reduce(
      (a, b) => a + b.subtotal,
      0,
    );
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
