const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Family extends Model {
    static associate(models) {
      Family.hasMany(models.Subfamily);

      Family.hasMany(models.Product);
    }
  }

  Family.init(
    {
      // attributes
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: '',
      },
    },
    {
      sequelize,
      // options
      modelName: 'family',
    },
  );
  Family.className = 'Family';
  return Family;
};
