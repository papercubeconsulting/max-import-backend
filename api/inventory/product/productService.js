const _ = require('lodash');

const { setResponse } = require('../../utils');

const Product = require('./productModel');

const readProduct = async reqBody => {
  const product = await Product.findByPk(reqBody.id);
  if (!product) return setResponse(400, 'Product not found.');

  return setResponse(200, 'Product found.', product);
};

const listProducts = async reqQuery => {
  const products = await Product.findAll({
    where: _.pick(reqQuery, ['elementId']),
  });

  return setResponse(200, 'Products found.', products);
};

const createProduct = async reqBody => {
  let product = await Product.findOne({
    where: _.pick(reqBody, ['familyId', 'subfamilyId', 'elementId', 'modelId']),
  });
  if (product) return setResponse(400, 'Product already exists.');

  product = await Product.create(reqBody);

  return setResponse(201, 'Product created.', product);
};

module.exports = {
  readProduct,
  listProducts,
  createProduct,
};
