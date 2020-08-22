const { Joi } = require('celebrate');
const moment = require('moment');

const { supplyStatus: status } = require('../../utils/constants');

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
    code: Joi.string()
      .allow('')
      .default(''),
    observations: Joi.string()
      .allow('')
      .default(''),
    status: Joi.string(), // TODO: REMOVE BECAUSE IS JUST FOR SEEDING
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
          suppliedQuantity: Joi.number().integer(), // TODO: REMOVE BECAUSE IS JUST FOR SEEDING
        }),
      )
      .unique((a, b) => a.productId === b.productId && a.boxSize === b.boxSize)
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
    code: Joi.string().allow(''),
    providerId: Joi.number().integer(),
    warehouseId: Joi.number().integer(),
    observations: Joi.string().allow(''),
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
      .unique((a, b) => a.productId === b.productId && a.boxSize === b.boxSize)
      .min(1)
      .required(),
  },
};

const PutStatus = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    status: Joi.string()
      .valid(status.CANCELLED, status.ATTENDED)
      .required(),
  },
};

const Delete = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

const PostAttendSuppliedProduct = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
    idSuppliedProduct: Joi.number()
      .integer()
      .required(),
  },
  body: {
    boxes: Joi.array()
      .items(
        Joi.number()
          .integer()
          .min(1),
      )
      .min(1)
      .required(),
  },
};

module.exports = {
  List,
  Get,
  Post,
  Put,
  Delete,
  // * Other
  PutStatus,
  PostAttendSuppliedProduct,
};