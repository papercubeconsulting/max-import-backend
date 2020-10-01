const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subfamily extends Model {
    static associate(models) {
      Subfamily.belongsTo(models.Family);
      Subfamily.hasMany(models.Element);

      Subfamily.hasMany(models.Product);
    }
  }

  Subfamily.init(
    {
      // attributes
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
      },
    },
    {
      sequelize,

      modelName: 'subfamily',
      indexes: [
        {
          unique: true,
          fields: ['name', 'familyId'],
        },
        {
          unique: true,
          fields: ['code', 'familyId'],
        },
      ],
    },
  );
  return Subfamily;
};
