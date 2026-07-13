const { Joi } = require('celebrate');

const { warehouseTypes: types } = require('../../utils/constants');

const List = {
  query: {
    type: Joi.string().valid(
      types.WAREHOUSE,
      types.STORE,
      types.DAMAGED,
      types.ADJUSTMENT,
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
    name: Joi.string()
      .max(255)
      .min(1)
      .required(),
    address: Joi.string()
      .max(255)
      .min(1)
      .required(),
    type: Joi.string()
      .valid(types.WAREHOUSE, types.STORE, types.DAMAGED, types.ADJUSTMENT)
      .default(types.WAREHOUSE),
  },
};
module.exports = {
  List,
  Get,
  Post,
};
