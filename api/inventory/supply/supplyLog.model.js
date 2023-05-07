const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SupplyLog extends Model {
    static associate(models) {
      SupplyLog.belongsTo(models.User);
      SupplyLog.belongsTo(models.Supply);
    }
  }
  SupplyLog.init(
    {
      log: { type: DataTypes.STRING },
      action: { type: DataTypes.STRING },
      detail: { type: DataTypes.STRING },
    },
    { sequelize, modelName: 'supplyLog' },
  );

  return SupplyLog;
};
