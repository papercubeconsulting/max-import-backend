const { setResponse } = require('../../utils');

const ProductBox = require('./productboxModel');

const readProductBox = async reqParams => {
  const productBox = await ProductBox.findByPk(reqParams.id);
  if (!productBox) return setResponse(404, 'ProductBox not found.');

  return setResponse(200, 'ProductBox found.', productBox);
};

const listProductBoxes = async reqQuery => {
  const productBoxes = await ProductBox.findAll({});

  return setResponse(200, 'ProductBoxs found.', productBoxes);
};

const createProductBox = async reqBody => {
  let productBox = await ProductBox.findOne({ where: { name: reqBody.name } });
  if (productBox) return setResponse(400, 'ProductBox already exists.');

  productBox = await ProductBox.create(reqBody);

  return setResponse(201, 'ProductBox created.', productBox);
};

module.exports = {
  readProductBox,
  listProductBoxes,
  createProductBox,
};
