const { Joi } = require('celebrate');

const List = {
  query: {
    stock: Joi.string()
      .valid('yes', 'no', 'all')
      .default('all'),
    code: Joi.string(),
    familyId: Joi.number().integer(),
    subfamilyId: Joi.number().integer(),
    elementId: Joi.number().integer(),
    modelId: Joi.number().integer(),
    providerId: Joi.number().integer(),

    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    pageSize: Joi.number()
      .integer()
      .min(1)
      .default(20),

    tradename: Joi.string()
      .lowercase()
      .trim(),
  },
};

const Get = {
  query: {
    noStock: Joi.boolean().default(false),
  },
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

    familyCode: Joi.string().required(),
    subfamilyCode: Joi.string().required(),
    elementCode: Joi.string().required(),

    providerId: Joi.number()
      .integer()
      .required(),

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
    imageBase64: Joi.string(),
    secondImageBase64: Joi.string(),
    thirdImageBase64: Joi.string(),
    compatibility: Joi.string(),
    tradename: Joi.string(),
    suggestedPrice: Joi.number()
      .integer()
      .required(),
  },
};

const Put = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    imageBase64: Joi.string().allow(null),
    secondImageBase64: Joi.string().allow(null),
    thirdImageBase64: Joi.string().allow(null),
    compatibility: Joi.string(),
    tradename: Joi.string(),
    suggestedPrice: Joi.number().integer(),
  },
};

const Delete = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};
module.exports = {
  List,
  Get,
  Post,
  Put,
  Delete,
};
