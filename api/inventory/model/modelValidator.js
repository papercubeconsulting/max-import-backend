const { Joi } = require('celebrate');

const List = {
  query: {
    elementId: Joi.number().integer(),
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
    elementId: Joi.number()
      .integer()
      .required(),
  },
};
module.exports = {
  List,
  Get,
  Post,
};
