/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);
const Family = require('../family/familyModel');

const Subfamily = sequelize.define(
  'subfamily',
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
        fields: ['name', 'familyId'],
      },
    ],
  },
);

Family.hasMany(Subfamily);
Subfamily.belongsTo(Family);

module.exports = Subfamily;
