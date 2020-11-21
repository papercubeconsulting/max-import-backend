const { Joi } = require('celebrate');
const { getDictValues, CLIENT } = require('@/utils');

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

const Update = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    active: Joi.bool(),

    type: Joi.string().valid(...getDictValues(CLIENT.TYPES)),
    idNumber: Joi.string(),
    name: Joi.string(),
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

const List = {
  query: Joi.object()
    .keys({
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

      active: Joi.bool(),

      name: Joi.string()
        .lowercase()
        .trim(),
      lastname: Joi.string()
        .lowercase()
        .trim(),
      idNumber: Joi.string(),
    })
    .and('from', 'to'),
};

module.exports = {
  Get,
  Post,
  List,
  Update,
};
