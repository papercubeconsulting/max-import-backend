/* eslint-disable no-param-reassign */
const { Model } = require('sequelize');

const { getDictValues, CLIENT } = require('../../utils/constants');

const { data: provinces } = require('./../geography/province');
const { data: regions } = require('./../geography/region');
const { data: districts } = require('./../geography/district');

module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      Client.belongsTo(models.DeliveryAgency, {
        foreignKey: 'defaultDeliveryAgencyId',
        allowNull: false,
      });

      Client.hasMany(models.Proforma);
    }
  }
  Client.init(
    {
      // attributes
      type: {
        // ? PERSON o COMPANY
        type: DataTypes.ENUM(getDictValues(CLIENT.TYPES)),
        allowNull: false,
      },
      idNumber: {
        // ? Puede ser DNI o RUC, se diferencia segun type
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      address: {
        type: DataTypes.STRING,
        defaultValue: '',
      },

      region: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      regionId: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      province: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      provinceId: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      district: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      districtId: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
    },
    {
      sequelize,
      // options
      modelName: 'client',
      hooks: {
        async beforeCreate(client) {
          client.region = regions.find(obj => obj.id === client.regionId).name;
          client.province = provinces.find(
            obj => obj.id === client.provinceId,
          ).name;
          client.district = districts.find(
            obj => obj.id === client.districtId,
          ).name;
        },
      },
    },
  );
  return Client;
};
