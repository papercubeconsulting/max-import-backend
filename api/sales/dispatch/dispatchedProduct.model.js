/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DispatchedProduct extends Model {
    static associate(models) {
      DispatchedProduct.belongsTo(models.Dispatch);
      DispatchedProduct.belongsTo(models.Product);
    }
  }
  DispatchedProduct.init(
    {
      // ? Cantidad de productos que deben ser despachados
      quantity: {
        type: DataTypes.INTEGER,
      },
      // ? Cantidad de productos que ya han sido despachados
      dispatched: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'dispatchedProduct',
      hooks: {
        // ? Se actualiza el stock del producto al crearse una nueva venta
        afterUpdate: async (dispatchedProduct, options) => {
          const { product: Product } = dispatchedProduct.sequelize.models;
          await Product.updateStock(dispatchedProduct.productId, {
            transaction: _.get(options, 'transaction'),
          });
        },
      },
    },
  );

  return DispatchedProduct;
};
