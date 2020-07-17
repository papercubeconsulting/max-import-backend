const { Joi } = require('celebrate');

const Post = {
  body: {
    clientId: Joi.number()
      .integer()
      .required(),
    discount: Joi.number()
      .precision(2)
      .custom(v => v * 100)
      .integer()
      .default(0),
    proformaProducts: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number()
            .integer()
            .required(),
          unitPrice: Joi.number()
            .precision(2)
            .required()
            .custom(v => v * 100)
            .integer(),
          quantity: Joi.number()
            .integer()
            .min(1)
            .required(),
        }),
      )
      .unique((a, b) => a.productId === b.productId)
      .min(1)
      .required(),
  },
};
const Get = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};
module.exports = {
  Post,
  Get,
};
