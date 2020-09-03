/* eslint-disable no-param-reassign */
const { Model } = require('sequelize');
const _ = require('lodash');

const { SALE, getDictValues } = require('../../utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    static associate(models) {
      Sale.hasMany(models.SoldProduct);
      Sale.belongsTo(models.User, { as: 'cashier', foreignKey: 'cashierId' });
      Sale.belongsTo(models.User, { as: 'seller', foreignKey: 'sellerId' });
      Sale.belongsTo(models.DeliveryAgency);
      Sale.belongsTo(models.BankAccount);
    }
  }
  Sale.init(
    {
      // ? Si el monto a cobrar a sido pagado
      type: {
        type: DataTypes.ENUM(getDictValues(SALE.TYPE)),
      },
      status: {
        type: DataTypes.ENUM(getDictValues(SALE.STATUS)),
        defaultValue: SALE.STATUS.DUE.value,
      },
      // ? Si es pago a cuenta (credito) o pago completo
      paymentType: {
        type: DataTypes.ENUM(getDictValues(SALE.PAYMENT_TYPE)),
      },
      // ? Si es consignacion o venta
      billingType: {
        type: DataTypes.ENUM(getDictValues(SALE.BILLING_TYPE)),
      },
      // ? Si sera recojo en tienda o envio por delivery
      dispatchmentType: {
        type: DataTypes.ENUM(getDictValues(SALE.DISPATCHMENT_TYPE)),
      },
      paymentMethod: DataTypes.STRING,

      subtotal: DataTypes.INTEGER, // ? Suma de precios parciales
      discount: DataTypes.INTEGER, // ? Descuento total
      total: DataTypes.INTEGER, // ? subtotal - discount
      credit: DataTypes.INTEGER, // ? Monto a credito
      due: DataTypes.INTEGER, // ? total - credit

      paidAt: DataTypes.DATE,

      // ? Campos para caso de venta no presencial
      voucherCode: DataTypes.STRING,
      voucherImage: {
        type: DataTypes.BLOB,
        get() {
          return this.getDataValue('voucherImage')
            ? this.getDataValue('voucherImage').toString('utf8')
            : undefined;
        },
      },
    },
    {
      sequelize,
      // options
      modelName: 'sale',
      defaultScope: {
        attributes: { exclude: ['voucherImage'] },
      },
      scopes: {
        full: {},
      },
    },
  );

  Sale.beforeCreate('SetId', async (sale, options) => {
    const proforma = await sale.getProforma({
      ..._.pick(options, ['transaction']),
    });
    sale.subtotal = proforma.subtotal;
    sale.total = proforma.total;
    sale.discount = proforma.discount;
    sale.due = sale.total - sale.credit;
    sale.status = sale.due ? SALE.STATUS.DUE.value : SALE.STATUS.PAID.value;
  });
  return Sale;
};
