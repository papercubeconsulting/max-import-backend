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
    familyId: Joi.number().integer(),
    subfamilyId: Joi.number().integer(),
    elementId: Joi.number().integer(),
    modelId: Joi.number().integer(),

    familyName: Joi.string()
      .min(1)
      .required(),
    subfamilyName: Joi.string()
      .min(1)
      .required(),
    elementName: Joi.string()
      .min(1)
      .required(),
    modelName: Joi.string()
      .min(1)
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
