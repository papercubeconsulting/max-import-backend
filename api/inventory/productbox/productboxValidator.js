const { Joi } = require('celebrate');

const GetCode = {
  params: {
    trackingCode: Joi.string().required(),
  },
};

module.exports = {
  GetCode,
};
