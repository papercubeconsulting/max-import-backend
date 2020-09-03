const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeliveryAgency extends Model {
    static associate(models) {
      DeliveryAgency.hasMany(models.Client, {
        foreignKey: 'defaultDeliveryAgencyId',
        allowNull: false,
      });

      DeliveryAgency.hasMany(models.Sale);
    }
  }
  DeliveryAgency.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'deliveryAgency',
    },
  );
  return DeliveryAgency;
};
