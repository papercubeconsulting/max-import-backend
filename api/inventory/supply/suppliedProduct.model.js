const { Model } = require('sequelize');

const { supplyStatus: status } = require('../../utils/constants');

const statuses = [status.PENDING, status.CANCELLED, status.ATTENDED];

module.exports = (sequelize, DataTypes) => {
  class SuppliedProduct extends Model {
    static associate(models) {
      SuppliedProduct.belongsTo(models.Supply);
      SuppliedProduct.belongsTo(models.Product);

      SuppliedProduct.hasMany(models.ProductBox);
    }
  }
  SuppliedProduct.init(
    {
      // attributes
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      suppliedQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      maxIndexSupplied: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      boxSize: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM(statuses),
        defaultValue: status.PENDING,
      },
    },
    {
      sequelize,
      // options
      modelName: 'suppliedProduct',
      indexes: [
        {
          unique: true,
          fields: ['boxSize', 'productId', 'supplyId'],
        },
      ],
    },
  );
  return SuppliedProduct;
};
