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
    observations: Joi.string()
      .allow('')
      .default(''),
    suppliedProducts: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number()
            .integer()
            .required(),
          boxSize: Joi.number()
            .integer()
            .required(),
          quantity: Joi.number()
            .integer()
            .required(),
        }),
      )
      .unique((a, b) => a.productId === b.productId && a.boxSize === b.boxSize),
  },
};

module.exports = {
  List,
  Get,
  Post,
};
