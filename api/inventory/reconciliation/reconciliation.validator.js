const { Joi } = require('celebrate');
const { reconciliationModes } = require('@/utils/constants');

module.exports = {
  Boxes: {
    query: {
      productId: Joi.number().integer().min(1).required(),
      search: Joi.string().trim().allow('').max(100),
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20),
    },
  },
  Preview: {
    query: {
      productId: Joi.number().integer().min(1).required(),
      warehouseId: Joi.number().integer().min(1).required(),
      countedStock: Joi.number().integer().min(0).required(),
    },
  },
  Confirm: {
    body: {
      mode: Joi.string()
        .valid(reconciliationModes.GLOBAL_COUNT, reconciliationModes.BOX_STOCK)
        .default(reconciliationModes.GLOBAL_COUNT),
      productId: Joi.number().integer().min(1).required(),
      warehouseId: Joi.when('mode', {
        is: reconciliationModes.BOX_STOCK,
        then: Joi.forbidden(),
        otherwise: Joi.number().integer().min(1).required(),
      }),
      countedStock: Joi.when('mode', {
        is: reconciliationModes.BOX_STOCK,
        then: Joi.forbidden(),
        otherwise: Joi.number().integer().min(0).required(),
      }),
      systemStock: Joi.when('mode', {
        is: reconciliationModes.BOX_STOCK,
        then: Joi.forbidden(),
        otherwise: Joi.number().integer().min(0).required(),
      }),
      sources: Joi.array()
        .items(
          Joi.object({
            productBoxId: Joi.number().integer().min(1).required(),
            quantity: Joi.number().integer().min(1).required(),
          }),
        )
        .when('mode', {
          is: reconciliationModes.BOX_STOCK,
          then: Joi.forbidden(),
          otherwise: Joi.array().default([]),
        }),
      boxes: Joi.when('mode', {
        is: reconciliationModes.BOX_STOCK,
        then: Joi.array()
          .items(
            Joi.object({
              productBoxId: Joi.number().integer().min(1).required(),
              targetStock: Joi.number().integer().min(0).required(),
            }),
          )
          .unique('productBoxId')
          .min(1)
          .required(),
        otherwise: Joi.forbidden(),
      }),
    },
  },
  BulkAction: {
    body: {
      ids: Joi.array().items(Joi.number().integer().min(1)).min(1).required(),
    },
  },
  List: {
    query: {
      productId: Joi.number().integer().min(1),
      status: Joi.string().valid('PENDING', 'DENIED', 'COMPLETED'),
      mode: Joi.string().valid(
        reconciliationModes.GLOBAL_COUNT,
        reconciliationModes.BOX_STOCK,
      ),
    },
  },
  Read: { params: { id: Joi.number().integer().min(1).required() } },
};
