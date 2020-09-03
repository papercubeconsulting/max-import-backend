/* eslint-disable no-param-reassign */
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProformaProduct extends Model {
    static associate(models) {
      ProformaProduct.belongsTo(models.Proforma);
      ProformaProduct.belongsTo(models.Product);
    }
  }
  ProformaProduct.init(
    {
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      unitPrice: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      subtotal: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      // options
      modelName: 'proformaProduct',
      indexes: [
        {
          unique: true,
          fields: ['productId', 'proformaId'],
        },
      ],
    },
  );

  ProformaProduct.beforeSave('calculatePrices', async proformaProduct => {
    proformaProduct.subtotal =
      proformaProduct.quantity * proformaProduct.unitPrice;
  });

  return ProformaProduct;
};
