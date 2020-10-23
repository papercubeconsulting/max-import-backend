/* eslint-disable no-param-reassign */
const { Joi } = require('celebrate');

const { getDictValues, orderByField, SALE } = require('@/utils');

const Post = {
  body: {
    proformaId: Joi.number()
      .integer()
      .required(),

    type: Joi.string()
      .valid(...getDictValues(SALE.TYPE))
      .required(),
    paymentType: Joi.string()
      .valid(...getDictValues(SALE.PAYMENT_TYPE))
      .required(),
    billingType: Joi.string()
      .valid(...getDictValues(SALE.BILLING_TYPE))
      .required(),
    dispatchmentType: Joi.string()
      .valid(...getDictValues(SALE.DISPATCHMENT_TYPE))
      .required(),
    paymentMethod: Joi.string()
      .valid(...SALE.PAYMENT_METHOD)
      .when('type', {
        is: SALE.TYPE.REMOTE.value,
        then: Joi.required(),
      }),
    initialPayment: Joi.number()
      .integer()
      .min(0)
      .required(),
    voucherCode: Joi.string().when('type', {
      is: SALE.TYPE.REMOTE.value,
      then: Joi.required(),
    }),
    voucherImage: Joi.string().when('type', {
      is: SALE.TYPE.REMOTE.value,
      then: Joi.required(),
    }),
    bankAccountId: Joi.number()
      .integer()
      .when('type', {
        is: SALE.TYPE.REMOTE.value,
        then: Joi.required(),
      }),
    deliveryAgencyId: Joi.number()
      .integer()
      .when('dispatchmentType', {
        is: SALE.DISPATCHMENT_TYPE.DELIVERY.value,
        then: Joi.required(),
      }),
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

      // ?
      orderBy: Joi.string().custom(orderByField(['createdAt', 'paidAt'])),

      // ? Filtrado por fecha de creacion
      from: Joi.date().iso(),
      to: Joi.date()
        .iso()
        .min(Joi.ref('from')),

      // ? Filtrado por fecha de pago
      paidAtFrom: Joi.date().iso(),
      paidAtTo: Joi.date()
        .iso()
        .min(Joi.ref('paidAtFrom')),

      status: Joi.string().valid(...getDictValues(SALE.STATUS)),
      type: Joi.string().valid(...getDictValues(SALE.TYPE)),
      billingType: Joi.string().valid(...getDictValues(SALE.BILLING_TYPE)),
      paymentType: Joi.string().valid(...getDictValues(SALE.PAYMENT_TYPE)),

      // ? Filtrado por cajero
      cashierId: Joi.number().integer(),

      // ? Filtrado por proforma
      proformaId: Joi.number().integer(),
    })
    .and('paidAtFrom', 'paidAtTo')
    .and('from', 'to'),
};

const PutPay = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
  body: {
    billingType: Joi.string()
      .valid(...getDictValues(SALE.BILLING_TYPE))
      .required(),
    paymentType: Joi.string()
      .valid(...getDictValues(SALE.PAYMENT_TYPE))
      .required(),
    paymentMethod: Joi.string()
      .valid(...SALE.PAYMENT_METHOD)
      .required(),
    initialPayment: Joi.number()
      .integer()
      .min(1)
      .required(),
    referenceNumber: Joi.string(),
    receivedAmount: Joi.number()
      .integer()
      .min(Joi.ref('initialPayment')),
  },
};

module.exports = {
  Post,
  Get,
  List,
  PutPay,
};
