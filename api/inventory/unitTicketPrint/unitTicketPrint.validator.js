const { Joi } = require('celebrate');
module.exports = {
  Create: {
    body: {
      productId: Joi.number().integer().min(1).required(),
      productBoxId: Joi.number().integer().min(1),
      warehouseId: Joi.number().integer().min(1),
      quantity: Joi.number().integer().min(1).max(10000).required(),
      reprintOfId: Joi.number().integer().min(1),
    },
  },
  Read: { params: { id: Joi.number().integer().min(1).required() } },
  List: {
    query: {
      productId: Joi.number().integer().min(1),
      productBoxId: Joi.number().integer().min(1),
      warehouseId: Joi.number().integer().min(1),
    },
  },
};
