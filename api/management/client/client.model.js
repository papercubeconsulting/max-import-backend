/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`@root/startup/db`);

const { DeliveryAgency } = require('../deliveryAgency/deliveryAgency.model');

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
      // ? Puede ser DNI o RUC, se diferencia segun type
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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

const { data: provinces } = require('./../geography/province');
const { data: regions } = require('./../geography/region');
const { data: districts } = require('./../geography/district');

Client.beforeCreate('setGeography', async client => {
  client.region = regions.find(obj => obj.id === client.regionId).name;
  client.province = provinces.find(obj => obj.id === client.provinceId).name;
  client.district = districts.find(obj => obj.id === client.districtId).name;
});

DeliveryAgency.hasMany(Client, {
  foreignKey: 'defaultDeliveryAgencyId',
  allowNull: false,
});

Client.belongsTo(DeliveryAgency, {
  foreignKey: 'defaultDeliveryAgencyId',
  allowNull: false,
});

module.exports = { Client };
