/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

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

Element.afterCreate('createDefaultModel', async (element, options) => {
  await Model.create({
    name: '-',
    elementId: element.id,
  });
});

Element.hasMany(Model);
Model.belongsTo(Element);

module.exports = Model;
