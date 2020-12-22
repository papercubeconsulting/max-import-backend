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
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    pageSize: Joi.number()
      .integer()
      .min(1)
      .default(20),

    name: Joi.string()
      .lowercase()
      .trim()
      .min(1)
      .max(255),
    lastname: Joi.string()
      .lowercase()
      .trim()
      .min(1)
      .max(255),
    idNumber: idNumberValidator.idNumber.optional(),
    role: Joi.string().valid(...getDictValues(ROLES)),
    active: Joi.boolean(),
  },
};

const Get = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

const ForgotPassword = {
  body: {
    ...emailValidator,
  },
};

const ResetPassword = {
  body: {
    ...emailValidator,
    token: Joi.string().required(),
    password: passwordValidator.password,
  },
};

const Put = {
  body: {
    idNumber: idNumberValidator.idNumber.optional(),
    email: emailValidator.email.optional(),
    name: Joi.string()
      .trim()
      .min(1)
      .max(255),
    lastname: Joi.string()
      .trim()
      .min(1)
      .max(255),
    phoneNumber: Joi.string()
      .trim()
      .min(1)
      .max(255),
    role: Joi.string().valid(...getDictValues(ROLES)),
    active: Joi.boolean(),
  },
};

module.exports = {
  Post,
  List,
  Get,
  Put,
  emailValidator,
  passwordValidator,
  idNumberValidator,
  ForgotPassword,
  ResetPassword,
};
