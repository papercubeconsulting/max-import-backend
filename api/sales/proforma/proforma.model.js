/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { Model } = require('sequelize');

const { getDictValues, PROFORMA, DISPATCH } = require('../../utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Proforma extends Model {
    static associate(models) {
      Proforma.belongsTo(models.User);
      Proforma.belongsTo(models.Client);
      Proforma.hasMany(models.ProformaProduct);
      Proforma.hasOne(models.Sale);
      Proforma.hasOne(models.Dispatch);
    }

    // * INSTANCE METHODS

    // ? Se valida que NO haya un producto cuya cantidad exceda el stock
    async checkStock(options) {
      const { product: Product } = this.sequelize.models;
      return !(
        await this.getProformaProducts({
          attributes: ['productId', 'quantity'],
          include: [{ model: Product, attributes: ['availableStock'] }],
          transaction: _.get(options, 'transaction'),
        })
      ).some(obj => obj.quantity > obj.product.availableStock);
    }

    async closeProforma(saleBody, options) {
      const {
        soldProduct: SoldProduct,
        dispatchedProduct: DispatchedProduct,
      } = this.sequelize.models;
      // ? Se obtiene los productos a vender
      const soldProducts = await this.getProformaProducts({
        attributes: ['productId', 'quantity'],
        transaction: _.get(options, 'transaction'),
      });
      // ? Se crea la nueva venta, incluyendo la data de los productos vendidos
      const sale = await this.createSale(
        { ...saleBody, soldProducts },
        {
          include: [SoldProduct],
          transaction: _.get(options, 'transaction'),
        },
      );

      // ? Se crea una nueva entidad de DISPATCH
      const dispatch = await this.createDispatch(
        {
          ...saleBody,
          status: DISPATCH.STATUS.OPEN.value,
          saleId: sale.id,
          dispatchedProducts: soldProducts,
        },
        {
          include: [DispatchedProduct],
          transaction: _.get(options, 'transaction'),
        },
      );

      // ? Se actualiza los estados de la proforma y el estado contable
      this.status = PROFORMA.STATUS.CLOSED.value;

      // ? En caso sea pago con deuda, el estado de la proforma sera PARTIAL
      // ? En caso sea pago completo, el estado de la proforma sera PAID
      this.saleStatus = PROFORMA.MAP_SALE_STATUS[sale.status];

      // ? Se actualiza el estado de la proforma para indicar que el despacho esta habilitado
      this.dispatchStatus = PROFORMA.DISPATCH_STATUS.OPEN.value;

      await this.save({ transaction: _.get(options, 'transaction') });
    }
  }
  Proforma.init(
    {
      // ? Representa si la proforma aun puede editarse, pasa a cerrarse cuando se genera la venta
      status: {
        type: DataTypes.ENUM(getDictValues(PROFORMA.STATUS)),
        defaultValue: PROFORMA.STATUS.OPEN.value,
      },
      // ? Representa el estado de la venta, pendiente si aun no se ha generado
      // ? En caso se genere hay dos posibilidades, que haya deuda (PARTIAL) o que se haya pagado (PAID)
      saleStatus: {
        type: DataTypes.ENUM(getDictValues(PROFORMA.SALE_STATUS)),
        defaultValue: PROFORMA.SALE_STATUS.PENDING.value,
      },
      // ? Representa el estado del despacho, bloqueado por defecto
      // ? Abierto cuando se habilita y se empiezan a despachar, completado al despachar todos los productos
      dispatchStatus: {
        type: DataTypes.ENUM(getDictValues(PROFORMA.DISPATCH_STATUS)),
        defaultValue: PROFORMA.DISPATCH_STATUS.LOCKED.value,
      },
      // ? Suma de los subtotales de cada elemento de la proforma
      subtotal: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // ? Monto de descuento aplicado a toda la proforma
      discount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // ? Diferencia entre subtotal y discount
      total: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // ? Cantidad total de unidades
      totalUnits: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      // * Virtual fields

      statusDescription: {
        type: DataTypes.VIRTUAL,
        get() {
          return PROFORMA.STATUS[this.status].name;
        },
      },
      saleStatusDescription: {
        type: DataTypes.VIRTUAL,
        get() {
          return PROFORMA.SALE_STATUS[this.saleStatus].name;
        },
      },
      dispatchStatusDescription: {
        type: DataTypes.VIRTUAL,
        get() {
          return PROFORMA.DISPATCH_STATUS[this.dispatchStatus].name;
        },
      },
      discountPercentage: {
        type: DataTypes.VIRTUAL,
        get() {
          return _.round(this.discount / this.subtotal, 2);
        },
      },
    },
    {
      sequelize,
      modelName: 'proforma',
      hooks: {
        // ? Calcular el precio total de la proforma
        beforeUpdate: async (proforma, options) => {
          const proformaProducts = await proforma.getProformaProducts({
            transaction: _.get(options, 'transaction'),
          });
          proforma.subtotal = proformaProducts.reduce(
            (a, b) => a + b.subtotal,
            0,
          );
          proforma.totalUnits = proformaProducts.reduce(
            (a, b) => a + b.quantity,
            0,
          );
          proforma.total = proforma.subtotal - proforma.discount;
        },
        afterCreate: async (proforma, options) => {
          const client = await proforma.getClient();
          client.active = true;
          await client.save();
        },
      },
    },
  );

  return Proforma;
};
