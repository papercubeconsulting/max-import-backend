const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductGroup extends Model {
    static associate(models) {
      ProductGroup.hasMany(models.Product, { foreignKey: 'groupId' });
    }
  }

  ProductGroup.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'productGroup',
    },
  );

  return ProductGroup;
};
