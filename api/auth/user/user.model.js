/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');
const crypto = require('crypto');
const moment = require('moment-timezone');

const { Op } = Sequelize;

const { ROLES, getDictValues } = require('../../utils/constants');

const JWT_FIELDS = [
  // ? Identificadores
  'id',
  'email',
  'role',
];

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // * CLASS METHODS
    static associate(models) {
      // define association here
      User.hasMany(models.ProductBoxLog);
      User.hasMany(models.Proforma);

      User.hasMany(models.Sale, { foreignKey: 'cashierId' });
      User.hasMany(models.Sale, { foreignKey: 'sellerId' });
      User.hasMany(models.Dispatch, { foreignKey: 'dispatcherId' });
    }

    // ? To find users based on different pk's
    static async findByIds(ids, scope = 'defaultScope') {
      const idIdentifiers = [['email'], ['idNumber']];
      return this.scope(scope).findOne({
        where: {
          [Op.or]: idIdentifiers
            .filter(fields => _.every(fields, _.partial(_.has, ids)))
            .map(fields => _.pick(ids, fields)),
        },
      });
    }

    static async hashPassword(password) {
      const salt = await bcrypt.genSalt(config.get('saltPow'));
      const hash = await bcrypt.hash(password, salt);
      return hash;
    }

    // * INSTANCE METHODS
    async isValidPassword(password) {
      if (!password) return false;
      const compare = await bcrypt.compare(password, this.password);
      return compare;
    }

    generateAuthToken() {
      const payload = _.pick(this.get(), JWT_FIELDS);
      return jwt.sign(payload, config.get('jwtSecret'));
    }

    async generatePasswordResetToken() {
      this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
      this.resetPasswordExpires = moment
        .tz('America/Lima')
        .add(10, 'minutes')
        .format();
      await this.save();
    }

    async updatePasswordByToken(data) {
      if (data.token !== this.resetPasswordToken)
        return { success: false, message: 'El token no es válido' };
      if (moment(this.resetPasswordExpires) < moment())
        return {
          success: false,
          message: 'El token ha expirado.',
        };
      this.password = await User.hashPassword(data.password);
      this.resetPasswordToken = '';
      this.resetPasswordExpires = moment.tz('America/Lima').subtract(1, 'day');
      await this.save();
      return {
        success: true,
        message: 'La contraseña ha sido actualizada',
      };
    }

    async generateToken(token) {
      if (!token) return false;
      const compare = await bcrypt.compare(token, this.password);
      return compare;
    }
  }
  User.init(
    {
      // attributes
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      idNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      email: {
        type: DataTypes.STRING,
        defaultValue: true,
        unique: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(getDictValues(ROLES)),
        defaultValue: ROLES.superuser.value,
      },

      resetPasswordToken: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      sequelize,
      // options
      modelName: 'user',
      defaultScope: {
        attributes: {
          exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'],
        },
      },
      scopes: {
        full: {},
      },

      // * Hooks
      hooks: {
        beforeCreate: async user => {
          user.password = await User.hashPassword(user.password);
        },
        // ? To hide password
        afterCreate: async user => {
          await user.reload();
        },
      },
    },
  );

  return User;
};
