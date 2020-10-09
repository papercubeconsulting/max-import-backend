const { Joi } = require('celebrate');

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
      from: Joi.date().iso(),
      to: Joi.date()
        .iso()
        .min(Joi.ref('paidAtFrom')),

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
    .and('paidAtFrom', 'paidAtTo'),
};

module.exports = {
  Get,
  List,
};