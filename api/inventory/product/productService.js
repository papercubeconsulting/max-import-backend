const _ = require('lodash');

const { setResponse } = require('../../utils');

const Product = require('./productModel');

const readProduct = async reqParams => {
  const product = await Product.findByPk(reqParams.id);
  if (!product) return setResponse(400, 'Product not found.');

  return setResponse(200, 'Product found.', product);
};

const listProducts = async reqQuery => {
  const products = await Product.findAll({});

  return setResponse(200, 'Products found.', products);
};

const createProduct = async reqBody => {
  let product = await Product.findOne({
    where: _.pick(reqBody, ['modelId']),
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
