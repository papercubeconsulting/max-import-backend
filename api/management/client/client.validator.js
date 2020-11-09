const { getDictValues, CLIENT } = require('@/utils');
const { Joi } = require('celebrate');

const Get = {
  params: {
    identifier: Joi.string().required(),
  },
};

const Post = {
  body: {
    type: Joi.string()
      .valid(...getDictValues(CLIENT.TYPES))
      .required(),
    idNumber: Joi.string()
      .when('type', {
        is: CLIENT.TYPES.COMPANY,
        then: Joi.string().length(11),
        otherwise: Joi.string().length(8),
      })
      .required(),
    name: Joi.string().required(),
    lastname: Joi.string().allow(''),
    email: Joi.string()
      .email()
      .allow(''),
    phoneNumber: Joi.string().allow(''),
    address: Joi.string().allow(''),

    regionId: Joi.string(),
    provinceId: Joi.string(),
    districtId: Joi.string(),

    defaultDeliveryAgencyId: Joi.number().integer(),
  },
};

module.exports = {
  Get,
  Post,
};
