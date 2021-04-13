const { Joi } = require('celebrate');
const { PRODUCTBOX_UPDATES, getDictValues } = require('../../utils/constants');

const GetCode = {
  params: {
    trackingCode: Joi.string().required(),
  },
};

const Get = {
  params: {
    identifier: Joi.string().required(),
  },
};

const Put = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    message: Joi.string()
      .valid(...getDictValues(PRODUCTBOX_UPDATES))
      .required(),
    warehouseId: Joi.number()
      .integer()
      .required(),
  },
};

const PutMove = {
  body: {
    boxes: Joi.array().items(
      Joi.object({
        id: Joi.number()
          .integer()
          .min(1)
          .required(),
        warehouseId: Joi.number()
          .integer()
          .min(1)
          .required(),
        previousWarehouseId: Joi.number()
          .integer()
          .min(1)
          .required(),
      }),
    ),
  },
};

const List = {
  query: {
    productId: Joi.string(),
  },
};

module.exports = {
  List,
  GetCode,
  Get,
  Put,
  PutMove,
};
