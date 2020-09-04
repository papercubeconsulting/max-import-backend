/* eslint-disable no-param-reassign */
const { Model } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');

const { SALE, getDictValues, PROFORMA } = require('../../utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    // * CLASS METHODS
    static associate(models) {
      Sale.hasMany(models.SoldProduct);
      Sale.belongsTo(models.User, { as: 'cashier', foreignKey: 'cashierId' });
      Sale.belongsTo(models.User, { as: 'seller', foreignKey: 'sellerId' });
      Sale.belongsTo(models.DeliveryAgency);
      Sale.belongsTo(models.BankAccount);

      Sale.belongsTo(models.Proforma);
    }
    // * INSTANCE METHODS

    async pay(reqBody) {
      await this.update({
        ...reqBody,
        status: SALE.STATUS.PAID.value,
        due: 0,
        credit: this.total - reqBody.initialPayment,
        paidAt: moment(),
      });
      const proforma = await this.getProforma();
      await proforma.update({ saleStatus: PROFORMA.SALE_STATUS.PAID.value });
    }
  }
  Sale.init(
    {
      // ? Tipo de venta, presencial o no presencial
      type: {
        type: DataTypes.ENUM(getDictValues(SALE.TYPE)),
      },
      status: {
        type: DataTypes.ENUM(getDictValues(SALE.STATUS)),
        defaultValue: SALE.STATUS.DUE.value,
      },
      // ? Si es pago recibido es el total (CASH) o tiene parte credito (CREDIT)
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
      initialPayment: DataTypes.INTEGER, // ? Monto pagado a cuenta (pagado al generar la venta)
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

      // ? Campos para proceso de venta
      referenceNumber: DataTypes.STRING, // ? Para el caso de pagos con tarjeta
      receivedAmount: DataTypes.INTEGER, // ? Para el caso de pagos en efectivo
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
      hooks: {
        // ? Calcular los valores monetarios de la venta
        beforeCreate: async (sale, options) => {
          const proforma = await sale.getProforma({
            ..._.pick(options, ['transaction']),
          });
          sale.subtotal = proforma.subtotal;
          sale.discount = proforma.discount;
          sale.total = proforma.total;
          sale.credit = sale.total - sale.initialPayment;

          // ? En caso la venta sea no presencial (type REMOTE) no se genera deuda
          sale.due =
            sale.type === SALE.TYPE.REMOTE.value ? 0 : sale.initialPayment;
          sale.status = sale.due
            ? SALE.STATUS.DUE.value
            : SALE.STATUS.PAID.value;
        },
      },
    },
  );

  return Sale;
};
