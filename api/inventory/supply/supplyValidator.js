const { Joi } = require('celebrate');
const moment = require('moment');

const List = {
  query: {
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    pageSize: Joi.number()
      .integer()
      .min(1)
      .default(100),

    from: Joi.date()
      .iso()
      .default(
        moment
          .utc()
          .startOf('day')
          .subtract(7, 'd')
          .toDate(),
      ),
    to: Joi.date()
      .iso()
      .min(Joi.ref('from'))
      .default(
        moment
          .utc()
          .endOf('day')
          .toDate(),
      ),
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
    providerId: Joi.number()
      .integer()
      .required(),
    warehouseId: Joi.number()
      .integer()
      .required(),
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
