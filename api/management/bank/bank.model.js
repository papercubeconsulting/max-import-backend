/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const Bank = sequelize.define(
  'bank',
  {
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
        fields: ['name'],
      },
    ],
  },
);

const BankAccount = sequelize.define(
  'bankAccount',
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    account: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    cci: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    // options
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
      {
        unique: true,
        fields: ['account'],
      },
      {
        unique: true,
        fields: ['cci'],
      },
    ],
  },
);

Bank.hasMany(BankAccount);
BankAccount.belongsTo(Bank);

module.exports = { Bank, BankAccount };
