const { Joi } = require('celebrate');
module.exports = {
  Preview: {
    query: {
      productId: Joi.number().integer().min(1).required(),
      warehouseId: Joi.number().integer().min(1).required(),
      countedStock: Joi.number().integer().min(0).required(),
    },
  },
  Confirm: {
    body: {
      productId: Joi.number().integer().min(1).required(),
      warehouseId: Joi.number().integer().min(1).required(),
      countedStock: Joi.number().integer().min(0).required(),
      systemStock: Joi.number().integer().min(0).required(),
      sources: Joi.array()
        .items(
          Joi.object({
            productBoxId: Joi.number().integer().min(1).required(),
            quantity: Joi.number().integer().min(1).required(),
          }),
        )
        .default([]),
    },
  },
  List: { query: { productId: Joi.number().integer().min(1) } },
  Read: { params: { id: Joi.number().integer().min(1).required() } },
};
