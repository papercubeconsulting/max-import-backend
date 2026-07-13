const { Joi } = require('celebrate');

module.exports = {
  GetByProductId: { params: { productId: Joi.number().integer().min(1).required() } },
  GetByCode: { params: { barcode: Joi.string().pattern(/^2\d{15}$/).required() } },
};
