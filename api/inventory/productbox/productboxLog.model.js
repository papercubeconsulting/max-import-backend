const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductBoxLog extends Model {
    static associate(models) {
      ProductBoxLog.belongsTo(models.User);
      ProductBoxLog.belongsTo(models.ProductBox);
      ProductBoxLog.belongsTo(models.Warehouse);
    }
  }
  ProductBoxLog.init(
    {
      log: { type: DataTypes.STRING },
    },
    { sequelize, modelName: 'productBoxLog' },
  );

  return ProductBoxLog;
};
