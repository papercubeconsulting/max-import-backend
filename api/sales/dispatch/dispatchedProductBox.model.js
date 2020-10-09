/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DispatchedProductBox extends Model {
    static associate(models) {
      DispatchedProductBox.belongsTo(models.DispatchedProduct);
      DispatchedProductBox.belongsTo(models.ProductBox);
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
      hooks: {},
    },
  );

  return DispatchedProductBox;
};
