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
  CreateExplodedBoxBatch: {
    body: {
      trackingCodes: Joi.array()
        .items(
          Joi.string()
            .trim()
            .pattern(/^1\d{15}$/)
            .required(),
        )
        .min(1)
        .max(200)
        .unique()
        .required(),
    },
  },
  Read: { params: { id: Joi.number().integer().min(1).required() } },
  List: {
    query: {
      productId: Joi.number().integer().min(1),
      productBoxId: Joi.number().integer().min(1),
      warehouseId: Joi.number().integer().min(1),
      batchId: Joi.string().uuid(),
    },
  },
};
