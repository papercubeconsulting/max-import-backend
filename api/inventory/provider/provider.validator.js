const { Joi } = require('celebrate');

const List = {
  query: {
    active: Joi.boolean().optional(),
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

const Put = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    name: Joi.string().required(),
    active: Joi.boolean().required(),
  },
};
module.exports = {
  List,
  Get,
  Post,
  Put,
};
