const { Joi } = require('celebrate');

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
    paymentMethod: Joi.string()
      .valid(...SALE.PAYMENT_METHOD)
      .when('type', {
        is: SALE.TYPE.REMOTE.value,
        then: Joi.required(),
      }),
    initialPayment: Joi.number()
      .integer()
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
  query: {
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    pageSize: Joi.number()
      .integer()
      .min(1)
      .default(20),

    status: Joi.string().valid(...getDictValues(SALE.STATUS)),
  },
};

module.exports = {
  Post,
  Get,
  List,
};
