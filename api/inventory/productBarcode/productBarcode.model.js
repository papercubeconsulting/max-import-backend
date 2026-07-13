const { Model } = require('sequelize');
const { buildUnitBarcode } = require('../unitInventory.utils');

module.exports = (sequelize, DataTypes) => {
  class ProductBarcode extends Model {
    static associate(models) {
      ProductBarcode.belongsTo(models.Product);
      ProductBarcode.belongsTo(models.User, {
        as: 'creator',
        foreignKey: 'createdBy',
      });
    }

    static buildUnitBarcode(productId) {
      return buildUnitBarcode(productId);
    }
  }

  ProductBarcode.init(
    {
      barcode: { type: DataTypes.STRING, allowNull: false, unique: true },
      productId: { type: DataTypes.INTEGER, allowNull: false },
      productCodeSnapshot: DataTypes.STRING,
      type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'UNIT_PRODUCT' },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      createdBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'productBarcode',
      indexes: [
        { unique: true, fields: ['barcode'] },
        { fields: ['productId', 'type', 'isActive'] },
      ],
    },
  );

  return ProductBarcode;
};
