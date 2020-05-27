/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);
const Subfamily = require('../subfamily/subfamilyModel');

const Element = sequelize.define(
  'element',
  {
    // attributes
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      defaultValue: '',
    },
  },
  {
    // options
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

// Subfamily.afterCreate('createDefaultElement', async (subfamily, options) => {
//   await Element.create({
//     name: '-',
//     subfamilyId: subfamily.id,
//   });
// });

Subfamily.hasMany(Element);
Element.belongsTo(Subfamily);

module.exports = Element;
