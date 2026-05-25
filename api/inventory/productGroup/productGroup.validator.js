const { Joi } = require('celebrate');

const List = {
  query: {
    isActive: Joi.boolean().optional(),
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
    isActive: Joi.boolean().default(true),
  },
};

const Put = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    name: Joi.string()
      .max(255)
      .min(1)
      .required(),
    code: Joi.string()
      .max(255)
      .min(1)
      .required(),
    isActive: Joi.boolean().required(),
  },
};

module.exports = {
  List,
  Get,
  Post,
  Put,
};
