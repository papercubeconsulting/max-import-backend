const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InventoryReconciliation extends Model {
    static associate(models) {
      InventoryReconciliation.belongsTo(models.Product);
      InventoryReconciliation.belongsTo(models.Warehouse);
      InventoryReconciliation.belongsTo(models.Warehouse, {
        as: 'adjustmentWarehouse',
        foreignKey: 'adjustmentWarehouseId',
      });
      InventoryReconciliation.belongsTo(models.Supply);
      InventoryReconciliation.belongsTo(models.User, {
        as: 'creator',
        foreignKey: 'createdBy',
      });
      InventoryReconciliation.belongsTo(models.User, {
        as: 'confirmer',
        foreignKey: 'confirmedBy',
      });
      InventoryReconciliation.hasMany(models.InventoryMovement, {
        foreignKey: 'reconciliationId',
      });
    }
  }

  InventoryReconciliation.init(
    {
      productId: { type: DataTypes.INTEGER, allowNull: false },
      warehouseId: DataTypes.INTEGER,
      adjustmentWarehouseId: DataTypes.INTEGER,
      systemStock: { type: DataTypes.INTEGER, allowNull: false },
      countedStock: { type: DataTypes.INTEGER, allowNull: false },
      delta: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'COMPLETED' },
      supplyId: DataTypes.INTEGER,
      createdBy: { type: DataTypes.INTEGER, allowNull: false },
      confirmedBy: DataTypes.INTEGER,
    },
    { sequelize, modelName: 'inventoryReconciliation' },
  );

  return InventoryReconciliation;
};
