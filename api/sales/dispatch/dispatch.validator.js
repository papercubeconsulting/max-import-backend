const { Joi } = require('celebrate');
const moment = require('moment');

const { getDictValues, DISPATCH } = require('../../utils/constants');

const Get = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
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

      // ? Filtrado por fecha de pago
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

      status: Joi.string().valid(...getDictValues(DISPATCH.STATUS)),
      dispatchmentType: Joi.string().valid(
        ...getDictValues(DISPATCH.DISPATCHMENT_TYPE),
      ),

      // ? Filtrado por proforma
      proformaId: Joi.number().integer(),

      // ? Filtrado por cliente
      name: Joi.string()
        .lowercase()
        .trim(),
      lastname: Joi.string()
        .lowercase()
        .trim(),
    })
    .and('from', 'to'),
};

const PostDispatchProductBox = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
    dispatchedProductId: Joi.number()
      .integer()
      .required(),
  },
  body: {
    productBoxId: Joi.number()
      .integer()
      .required(),
    quantity: Joi.number()
      .integer()
      .required(),
  },
};

module.exports = {
  Get,
  List,
  PostDispatchProductBox,
};
