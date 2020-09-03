const { Model: SeqModel, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Model extends SeqModel {
    static associate(models) {
      Model.belongsTo(models.Element);

      Model.hasOne(models.Product); // TODO: Deberia ser 1-1
    }
  }

  Model.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize, // options
      modelName: 'model',
      indexes: [
        {
          unique: true,
          fields: ['name', 'elementId'],
        },
      ],
    },
  );

  Model.afterCreate('setCode', async model => {
    const next =
      (await Model.max('code', {
        where: {
          elementId: {
            [Op.eq]: model.elementId,
          },
          createdAt: {
            [Op.lt]: model.createdAt,
          },
        },
      })) || 0;
    await model.update({ code: next + 1 });
  });

  return Model;
};
