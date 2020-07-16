/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const { getDictValues, CLIENT } = require('../../utils/constants');

const Client = sequelize.define(
  'client',
  {
    // attributes
    type: {
      // ? PERSON o COMPANY
      type: Sequelize.ENUM(getDictValues(CLIENT.TYPES)),
      allowNull: false,
    },
    idNumber: {
      // ? Puede ser DNI o RUC, se diferencia segun el tipo
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    address: {
      type: Sequelize.STRING,
      defaultValue: '',
    },

    region: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    regionId: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    province: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    provinceId: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    district: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
    districtId: {
      type: Sequelize.STRING,
      defaultValue: '',
    },
  },
  {
    // options
    indexes: [
      {
        unique: true,
        fields: ['idNumber'],
      },
    ],
  },
);

module.exports = { Client };
