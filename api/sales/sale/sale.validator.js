const { Joi } = require('celebrate');
const moment = require('moment');

const { getDictValues, SALE } = require('../../utils/constants');

const Post = {
  body: {
    proformaId: Joi.number()
      .integer()
      .required(),

    type: Joi.string().valid(...getDictValues(SALE.TYPE)),
    paymentType: Joi.string().valid(...getDictValues(SALE.PAYMENT_TYPE)),
    billingType: Joi.string().valid(...getDictValues(SALE.BILLING_TYPE)),
    dispatchmentType: Joi.string().valid(
      ...getDictValues(SALE.DISPATCHMENT_TYPE),
    ),
    paymentMethod: Joi.string().valid(...SALE.PAYMENT_METHOD),
    credit: Joi.number()
      .precision(2)
      .custom(v => v * 100)
      .integer()
      .when('paymentType', {
        is: SALE.PAYMENT_TYPE.CREDIT.value,
        then: Joi.number().min(1),
      })
      .default(0),
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

module.exports = {
  Post,
  Get,
};
