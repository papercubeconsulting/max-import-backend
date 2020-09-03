const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BankAccount extends Model {
    static associate(models) {
      BankAccount.belongsTo(models.Bank);

      BankAccount.hasMany(models.Sale);
    }
  }
  BankAccount.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cci: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,

      // options
      modelName: 'bankAccount',
      indexes: [
        {
          unique: true,
          fields: ['name', 'bankId'],
        },
        {
          unique: true,
          fields: ['account', 'bankId'],
        },
        {
          unique: true,
          fields: ['cci', 'bankId'],
        },
      ],
    },
  );
  return BankAccount;
};
