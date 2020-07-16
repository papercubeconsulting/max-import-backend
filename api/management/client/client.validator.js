const { Joi } = require('celebrate');

const Get = {
  params: {
    identifier: Joi.string().required(),
  },
};

module.exports = {
  Get,
};
