/* eslint-disable no-param-reassign */
const { Model } = require('sequelize');

const { DISPATCH, getDictValues } = require('../../utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Dispatch extends Model {
    // * CLASS METHODS
    static associate(models) {
      Dispatch.belongsTo(models.User, {
        as: 'dispatcher',
        foreignKey: 'dispatcherId',
      });
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
      // * Virtual fields

      statusDescription: {
        type: DataTypes.VIRTUAL,
        get() {
          return DISPATCH.STATUS[this.status].name;
        },
      },
      dispatchmentTypeDescription: {
        type: DataTypes.VIRTUAL,
        get() {
          return DISPATCH.DISPATCHMENT_TYPE[this.dispatchmentType].name;
        },
      },
      completedAt: DataTypes.DATE,
    },
    {
      sequelize,
      // options
      modelName: 'dispatch',
      hooks: {},
    },
  );

  return Dispatch;
};
