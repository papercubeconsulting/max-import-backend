const { Joi } = require('celebrate');

const List = {
  query: {
    familyId: Joi.number().integer(),
    providerId: Joi.number().integer(),
  },
};

const Get = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

const Post = {
  body: {
    name: Joi.string()
      .max(255)
      .min(1)
      .required(),
    code: Joi.string()
      .max(255)
      .min(1)
      .required(),
    familyId: Joi.number()
      .integer()
      .required(),
  },
};
module.exports = {
  List,
  Get,
  Post,
};
