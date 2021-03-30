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

const List ={
  query:{
    productId: Joi.string(),
  }
};

module.exports = {
  List,
  GetCode,
  Get,
  Put,
};
