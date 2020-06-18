/* eslint-disable consistent-return */
const { Joi } = require('celebrate');

const { ROLES, getDictValues } = require('../../utils/constants');

const idNumberValidator = {
  idNumber: Joi.string()
    .trim()
    .length(8)
    .regex(/^\d+$/)
    .required(),
};
const emailValidator = {
  email: Joi.string()
    .lowercase()
    .trim()
    .min(5)
    .max(255)
    .email()
    .required(),
};

const passwordValidator = {
  password: Joi.string()
    .min(8)
    .max(255)
    .required(),
};

const Post = {
  body: {
    ...idNumberValidator,
    ...emailValidator,
    ...passwordValidator,
    name: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .required(),
    lastname: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .required(),
    phoneNumber: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .default(''),
    role: Joi.string()
      .valid(...getDictValues(ROLES))
      .default(ROLES.superuser.value),
    active: Joi.boolean().default(true),
  },
};

const List = {
  query: {
    name: Joi.string()
      .trim()
      .min(1)
      .max(255),
    lastname: Joi.string()
      .trim()
      .min(1)
      .max(255),
    idNumber: idNumberValidator.idNumber.optional(),
  },
};

const Get = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

module.exports = {
  Post,
  List,
  Get,

  emailValidator,
  passwordValidator,
  idNumberValidator,
};
