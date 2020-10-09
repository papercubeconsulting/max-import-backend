/* eslint-disable no-param-reassign */
const { Model } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');

const { DISPATCH, getDictValues } = require('../../utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Dispatch extends Model {
    // * CLASS METHODS
    static associate(models) {
      // Dispatch.belongsTo(models.User, {
      //   as: 'dispatcher',
      //   foreignKey: 'dispatcherId',
      // });
      Dispatch.hasMany(models.DispatchedProduct);
      Dispatch.belongsTo(models.Proforma);
      Dispatch.belongsTo(models.Sale);
      Dispatch.belongsTo(models.DeliveryAgency);
    }
    // * INSTANCE METHODS
  }
  Dispatch.init(
    {
      status: {
        type: DataTypes.ENUM(getDictValues(DISPATCH.STATUS)),
        defaultValue: DISPATCH.STATUS.LOCKED.value,
      },
      // ? Si sera recojo en tienda o envio por delivery
      dispatchmentType: {
        type: DataTypes.ENUM(getDictValues(DISPATCH.DISPATCHMENT_TYPE)),
      },
      completedAt: DataTypes.DATE,
    },
    {
      sequelize,
      // options
      modelName: 'dispatch',
      hooks: {
        beforeCreate: async (dispatch, options) => {},
      },
    },
  );

  return Dispatch;
};
