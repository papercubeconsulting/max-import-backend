/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DispatchedProductBox extends Model {
    static associate(models) {
      DispatchedProductBox.belongsTo(models.DispatchedProduct);
      DispatchedProductBox.belongsTo(models.ProductBox);
      DispatchedProductBox.belongsTo(models.User, {
        as: 'dispatcher',
        foreignKey: 'dispatcherId',
      });
      DispatchedProductBox.belongsTo(models.Warehouse);
    }
  }
  DispatchedProductBox.init(
    {
      // ? Cantidad de productos que han sido despachados de la caja
      quantity: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'dispatchedProductBox',
      hooks: {
        // ? Se actualiza el stock del producto al crearse una nueva venta
        afterCreate: async (dispatchedProductBox, options) => {
          const {
            product: Product,
            dispatchedProduct: DispatchedProduct,
            productBox: ProductBox,
          } = dispatchedProductBox.sequelize.models;

          const t = _.get(options, 'transaction');

          await DispatchedProduct.increment(
            { dispatched: dispatchedProductBox.quantity },
            {
              where: { id: dispatchedProductBox.dispatchedProductId },
              transaction: t,
            },
          );

          await ProductBox.increment(
            { stock: -dispatchedProductBox.quantity },
            {
              where: { id: dispatchedProductBox.productBoxId },
              transaction: t,
            },
          );

          const productBox = await dispatchedProductBox.getProductBox({
            transaction: t,
          });

          productBox.registerLog(
            `Despachado ${dispatchedProductBox.quantity} unidades`,
            dispatchedProductBox.dispatcherId,
            { transaction: t },
          );

          await Product.updateStock(dispatchedProductBox.productId, {
            transaction: t,
          });
        },
      },
    },
  );

  return DispatchedProductBox;
};
