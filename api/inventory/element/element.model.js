const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Element extends Model {
    static associate(models) {
      Element.belongsTo(models.Subfamily);
      Element.hasMany(models.Model);

      Element.hasMany(models.Product);
    }
  }

  Element.init(
    {
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
      // options
      modelName: 'element',
      indexes: [
        {
          unique: true,
          fields: ['name', 'subfamilyId'],
        },
        {
          unique: true,
          fields: ['code', 'subfamilyId'],
        },
      ],
    },
  );
  return Element;
};
