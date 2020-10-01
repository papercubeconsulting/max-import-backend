const { Joi } = require('celebrate');

const Get = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

const List = {
  query: {},
};

const Post = {
  body: {
    name: Joi.string().required(),
  },
};

module.exports = {
  Get,
  List,
  Post,
};
