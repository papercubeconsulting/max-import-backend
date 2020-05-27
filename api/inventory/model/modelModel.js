/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const { Op } = Sequelize;

const sequelize = require(`${process.cwd()}/startup/db`);
const Element = require('../element/elementModel');

const Model = sequelize.define(
  'model',
  {
    // attributes
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    code: {
      type: Sequelize.INTEGER,
    },
  },
  {
    // options
    indexes: [
      {
        unique: true,
        fields: ['name', 'elementId'],
      },
    ],
  },
);

Model.afterCreate('setCode', async (model, options) => {
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

// Element.afterCreate('createDefaultModel', async (element, options) => {
//   await Model.create({
//     name: '-',
//     elementId: element.id,
//   });
// });

Element.hasMany(Model);
Model.belongsTo(Element);

module.exports = Model;
