const { Model } = require('sequelize');

const { warehouseTypes: types } = require('../../utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Warehouse extends Model {
    static associate(models) {
      Warehouse.hasMany(models.ProductBox);
      Warehouse.hasMany(models.ProductBoxLog);

      Warehouse.hasMany(models.Supply);
    }
  }
  Warehouse.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM([types.WAREHOUSE, types.STORE, types.DAMAGED]),
        defaultValue: types.WAREHOUSE,
      },
    },
    {
      sequelize,
      modelName: 'warehouse',
    },
  );
  return Warehouse;
};
