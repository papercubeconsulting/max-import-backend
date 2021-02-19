const { Sequelize } = require('@root/startup/db');
const { Model } = require('sequelize');
const SequelizeLib = require('sequelize');
const { supplyStatus: status } = require('../../utils/constants');

const statuses = [status.PENDING, status.CANCELLED, status.ATTENDED];

module.exports = (sequelize, DataTypes) => {
  class Supply extends Model {
    static associate(models) {
      Supply.hasMany(models.SuppliedProduct);
      Supply.hasMany(models.ProductBox);

      Supply.belongsTo(models.Warehouse);
      Supply.belongsTo(models.Provider);
    }
  }
  Supply.init(
    {
      code: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      attentionDate: {
        type: DataTypes.DATE,
      },
      cancellationDate: {
        type: DataTypes.DATE,
      },
      arrivalDate: {
        type: DataTypes.DATE,
        defaultValue: SequelizeLib.NOW,
      },
      observations: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM(statuses),
        defaultValue: status.PENDING,
      },
    },
    {
      sequelize,
      // options
      modelName: 'supply',
      paranoid: true,
    },
  );
  return Supply;
};
