const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InventoryMovement extends Model {
    static associate(models) {
      InventoryMovement.belongsTo(models.Product);
      InventoryMovement.belongsTo(models.ProductBox, {
        as: 'sourceProductBox',
        foreignKey: 'sourceProductBoxId',
      });
      InventoryMovement.belongsTo(models.ProductBox, {
        as: 'targetProductBox',
        foreignKey: 'targetProductBoxId',
      });
      InventoryMovement.belongsTo(models.Warehouse, {
        as: 'fromWarehouse',
        foreignKey: 'fromWarehouseId',
      });
      InventoryMovement.belongsTo(models.Warehouse, {
        as: 'toWarehouse',
        foreignKey: 'toWarehouseId',
      });
      InventoryMovement.belongsTo(models.User);
      InventoryMovement.belongsTo(models.Supply);
      InventoryMovement.belongsTo(models.Dispatch);
      InventoryMovement.belongsTo(models.InventoryReconciliation, {
        foreignKey: 'reconciliationId',
      });
    }
  }

  InventoryMovement.init(
    {
      type: { type: DataTypes.STRING, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      productId: { type: DataTypes.INTEGER, allowNull: false },
      sourceProductBoxId: DataTypes.INTEGER,
      targetProductBoxId: DataTypes.INTEGER,
      fromWarehouseId: DataTypes.INTEGER,
      toWarehouseId: DataTypes.INTEGER,
      sourceStockBefore: DataTypes.INTEGER,
      sourceStockAfter: DataTypes.INTEGER,
      targetStockBefore: DataTypes.INTEGER,
      targetStockAfter: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      supplyId: DataTypes.INTEGER,
      dispatchId: DataTypes.INTEGER,
      reconciliationId: DataTypes.INTEGER,
      description: DataTypes.TEXT,
      metadata: DataTypes.JSONB,
    },
    { sequelize, modelName: 'inventoryMovement' },
  );

  return InventoryMovement;
};
