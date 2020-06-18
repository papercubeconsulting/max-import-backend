/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');

const { Op } = Sequelize;

const sequelize = require(`${process.cwd()}/startup/db`);

const { ROLES, getDictValues } = require('../../utils/constants');

const User = sequelize.define(
  'user',
  {
    // attributes
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    idNumber: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      default: true,
    },
    email: {
      type: Sequelize.STRING,
      default: true,
    },
    phoneNumber: {
      type: Sequelize.STRING,
      default: '',
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    role: {
      type: Sequelize.ENUM(getDictValues(ROLES)),
      defaultValue: ROLES.superuser.value,
    },
  },
  {
    // options

    attributes: { exclude: ['password'] },
    indexes: [
      {
        unique: true,
        fields: ['idNumber'],
      },
      {
        unique: true,
        fields: ['email'],
      },
    ],
  },
);

User.findByIds = function(ids) {
  const idIdentifiers = [['email'], ['idNumber']];

  return this.findOne({
    where: {
      [Op.or]: idIdentifiers
        .filter(fields => _.every(fields, _.partial(_.has, ids)))
        .map(fields => _.pick(ids, fields)),
    },
  });
};

User.hashPassword = async password => {
  const salt = await bcrypt.genSalt(config.get('saltPow'));
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

User.beforeCreate('hashPassword', async user => {
  user.password = await User.hashPassword(user.password);
  user.hasPassword = true;
});

module.exports = { User };
