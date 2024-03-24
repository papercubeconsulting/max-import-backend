const { Model } = require('sequelize');

const { warehouseTypes: types } = require('../../utils/constants');

function pad(n, width, z) {
  const zero = z || '0';
  const strN = n.toString();
  return strN.length >= width
    ? strN
    : new Array(width - strN.length + 1).join(zero) + strN;
}

module.exports = (sequelize, DataTypes) => {
  class Warehouse extends Model {
    static associate(models) {
      Warehouse.hasMany(models.ProductBox);
      Warehouse.hasMany(models.ProductBoxLog);
      Warehouse.hasMany(models.Supply);
      Warehouse.hasMany(models.DispatchedProductBox);
    }
  }
  Warehouse.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      subDivision: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      trackingCode: {
        // ? Codigo de seguimiento
        type: DataTypes.STRING,
        allowNull: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: DataTypes.ENUM([types.WAREHOUSE, types.STORE, types.DAMAGED]),
        defaultValue: types.WAREHOUSE,
      },
    },
    {
      sequelize,
      modelName: 'warehouse',
      indexes: [
        {
          unique: true,
          fields: ['name', 'subDivision'],
        },
        {
          fields: ['trackingCode'],
        },
      ],
      hooks: {
        afterCreate: async warehouse => {
          const trackingCode = `1${pad(warehouse.id, 6)}${pad(
            warehouse.id,
            6,
          )}${pad(warehouse.id, 3)}`;
          await warehouse.update({ trackingCode });
        },
      },
    },
  );
  return Warehouse;
};
