/* eslint-disable no-param-reassign */
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
    },
  );

  // ? Se actualiza el stock del producto al crearse una nueva venta
  SoldProduct.afterCreate('UpdateStock', async (soldProduct, options) => {
    const { Product } = soldProduct.sequelize.models;
    await Product.updateStock(soldProduct.productId, {
      transaction: options.transaction,
    });
  });

  return SoldProduct;
};
