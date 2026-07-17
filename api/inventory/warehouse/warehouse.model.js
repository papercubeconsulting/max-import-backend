const { Model } = require('sequelize');

const { warehouseTypes: types } = require('../../utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Warehouse extends Model {
    static associate(models) {
      Warehouse.hasMany(models.ProductBox);
      Warehouse.hasMany(models.ProductBoxLog);

      Warehouse.hasMany(models.Supply);
      Warehouse.hasMany(models.Supply, {
        as: 'outgoingStoreReturns',
        foreignKey: 'sourceWarehouseId',
      });
      Warehouse.hasMany(models.DispatchedProductBox);
      Warehouse.hasMany(models.UnitTicketPrint);
      Warehouse.hasMany(models.InventoryReconciliation);
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
        type: DataTypes.ENUM([
          types.WAREHOUSE,
          types.STORE,
          types.DAMAGED,
          types.ADJUSTMENT,
        ]),
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
