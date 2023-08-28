const { Model, DataTypes } = require('sequelize');

module.exports = sequelize => {
  class DiscountProforma extends Model {
    static associate(models) {
      DiscountProforma.belongsTo(models.Proforma);
      DiscountProforma.belongsTo(models.User);
    }
  }
  DiscountProforma.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        acceptedDiscount: DataTypes.INTEGER,
      },
      approvedDiscount: {
        type: DataTypes.INTEGER,
      },
    },
    { sequelize, modelName: 'discountProforma' },
  );

  return DiscountProforma;
};
