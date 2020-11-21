const { Joi } = require('celebrate');

const { getDictValues, PROFORMA } = require('../../utils/constants');

const Post = {
  body: {
    clientId: Joi.number()
      .integer()
      .required(),
    discount: Joi.number()
      .integer()
      .required(),
    proformaProducts: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number()
            .integer()
            .required(),
          unitPrice: Joi.number()
            .integer()
            .required(),
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

const Put = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    clientId: Joi.number()
      .integer()
      .required(),
    discount: Joi.number()
      .integer()
      .required(),
    proformaProducts: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number()
            .integer()
            .required(),
          unitPrice: Joi.number()
            .integer()
            .required(),
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

const List = {
  query: {
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    pageSize: Joi.number()
      .integer()
      .min(1)
      .default(20),

    from: Joi.date().iso(),
    to: Joi.date()
      .iso()
      .min(Joi.ref('from')),
    id: Joi.number().integer(),
    userId: Joi.number().integer(),

    // ? Status
    status: Joi.string().valid(...getDictValues(PROFORMA.STATUS)),
    saleStatus: Joi.string().valid(...getDictValues(PROFORMA.SALE_STATUS)),
    dispatchStatus: Joi.string().valid(
      ...getDictValues(PROFORMA.DISPATCH_STATUS),
    ),

    name: Joi.string()
      .lowercase()
      .trim(),
    lastname: Joi.string()
      .lowercase()
      .trim(),
  },
};

module.exports = {
  Post,
  Put,
  Get,
  List,
};
