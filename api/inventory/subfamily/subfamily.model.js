/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`@root/startup/db`);
const { Family } = require('../family/family.model');

const Subfamily = sequelize.define(
  'subfamily',
  {
    // attributes
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    },
  },
  {
    // options
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

// Family.afterCreate('createDefaultSubfamily', async (family, options) => {
//   await Subfamily.create({
//     name: '-',
//     familyId: family.id,
//   });
// });

Family.hasMany(Subfamily);
Subfamily.belongsTo(Family);

module.exports = { Subfamily };
