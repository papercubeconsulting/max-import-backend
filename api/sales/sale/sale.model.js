/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-param-reassign */
const _ = require('lodash');
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const { User } = require('../../auth/user/user.model');
const { Product } = require('../../inventory/product/product.model');
const {
  DeliveryAgency,
} = require('../../management/deliveryAgency/deliveryAgency.model');
const { BankAccount } = require('../../management/bank/bank.model');

const { SALE, getDictValues } = require('../../utils/constants');
const { Proforma, ProformaProduct } = require('../proforma/proforma.model');

const Sale = sequelize.define(
  'sale',
  {
    // ? Si el monto a cobrar a sido pagado
    type: {
      type: Sequelize.ENUM(getDictValues(SALE.TYPE)),
    },
    status: {
      type: Sequelize.ENUM(getDictValues(SALE.STATUS)),
      defaultValue: SALE.STATUS.DUE.value,
    },
    // ? Si es pago a cuenta (credito) o pago completo
    paymentType: {
      type: Sequelize.ENUM(getDictValues(SALE.PAYMENT_TYPE)),
    },
    // ? Si es consignacion o venta
    billingType: {
      type: Sequelize.ENUM(getDictValues(SALE.BILLING_TYPE)),
    },
    // ? Si sera recojo en tienda o envio por delivery
    dispatchmentType: {
      type: Sequelize.ENUM(getDictValues(SALE.DISPATCHMENT_TYPE)),
    },
    paymentMethod: Sequelize.STRING,

    subtotal: Sequelize.INTEGER, // ? Suma de precios parciales
    discount: Sequelize.INTEGER, // ? Descuento total
    total: Sequelize.INTEGER, // ? subtotal - discount
    credit: Sequelize.INTEGER, // ? Monto a credito
    due: Sequelize.INTEGER, // ? total - credit

    paidAt: Sequelize.DATE,

    // ? Campos para caso de venta no presencial
    voucherCode: Sequelize.STRING,
    voucherImage: {
      type: Sequelize.DataTypes.BLOB,
      get() {
        return this.getDataValue('voucherImage')
          ? this.getDataValue('voucherImage').toString('utf8')
          : undefined;
      },
    },
  },
  {
    // options
    defaultScope: {
      attributes: { exclude: ['voucherImage'] },
    },
    scopes: {
      full: {},
    },
  },
);

const SoldProduct = sequelize.define(
  'soldProduct',
  {
    // attributes
    // ? Cantidad de productos que fueron vendidos
    quantity: {
      type: Sequelize.INTEGER,
    },
  },
  {
    // options
  },
);

Sale.beforeCreate('SetId', async (sale, options) => {
  const proforma = await sale.getProforma({
    ..._.get(options, 'transaction', {}),
  });
  sale.subtotal = proforma.subtotal;
  sale.total = proforma.total;
  sale.discount = proforma.discount;
  sale.due = sale.total - sale.credit;
  sale.status = sale.due ? SALE.STATUS.DUE.value : SALE.STATUS.PAI.valueD;
});

Sale.hasMany(SoldProduct);
SoldProduct.belongsTo(Sale);

Product.hasMany(SoldProduct);
SoldProduct.belongsTo(Product);

// ? Cajero para el caso de venta presencial
// ? Vendedor, aquel que genera la venta
User.hasMany(Sale, { foreignKey: 'cashierId' });
User.hasMany(Sale, { foreignKey: 'sellerId' });
Sale.belongsTo(User, { as: 'cashier', foreignKey: 'cashierId' });
Sale.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

// ? Agencia para delivery
DeliveryAgency.hasMany(Sale);
Sale.belongsTo(DeliveryAgency);

// ? Cuenta bancaria a la que se hizo el pago
BankAccount.hasMany(Sale);
Sale.belongsTo(BankAccount);

module.exports = { Sale, SoldProduct };
