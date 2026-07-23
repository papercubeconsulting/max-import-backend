const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UnitTicketPrint extends Model {
    static associate(models) {
      UnitTicketPrint.belongsTo(models.Product);
      UnitTicketPrint.belongsTo(models.ProductBox);
      UnitTicketPrint.belongsTo(models.Warehouse);
      UnitTicketPrint.belongsTo(models.User);
      UnitTicketPrint.belongsTo(models.UnitTicketPrint, {
        as: 'reprintOf',
        foreignKey: 'reprintOfId',
      });
    }
  }

  UnitTicketPrint.init(
    {
      productId: { type: DataTypes.INTEGER, allowNull: false },
      productBoxId: DataTypes.INTEGER,
      warehouseId: DataTypes.INTEGER,
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      batchId: DataTypes.UUID,
      reprintOfId: DataTypes.INTEGER,
      userId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'unitTicketPrint',
      indexes: [{ fields: ['batchId'] }],
    },
  );

  return UnitTicketPrint;
};
