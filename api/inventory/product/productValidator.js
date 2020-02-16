const { Joi } = require('celebrate');

const List = {
  query: {
    // elementId: Joi.number().integer(),
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
    modelId: Joi.number()
      .integer()
      .required(),
    compatibility: Joi.string(),
    suggestedPrice: Joi.number()
      .integer()
      .required(),
  },
};
module.exports = {
  List,
  Get,
  Post,
};
