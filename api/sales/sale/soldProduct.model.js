/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SoldProduct extends Model {
    static associate(models) {
      SoldProduct.belongsTo(models.Sale);
      SoldProduct.belongsTo(models.Product);
    }
  }
  SoldProduct.init(
    {
      // ? Cantidad de productos que fueron vendidos
      quantity: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'soldProduct',
      hooks: {
        // ? Se actualiza el stock del producto al crearse una nueva venta
        afterCreate: async (soldProduct, options) => {
          const { product: Product } = soldProduct.sequelize.models;
          await Product.updateStock(soldProduct.productId, {
            transaction: _.get(options, 'transaction'),
          });
        },
      },
    },
  );

  return SoldProduct;
};
