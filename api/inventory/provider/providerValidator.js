const { Joi } = require('celebrate');

const List = {
  query: {
    active: Joi.boolean().default(true),
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
  },
};
module.exports = {
  List,
  Get,
  Post,
};
