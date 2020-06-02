const { setResponse } = require('../../utils');

const ProductBox = require('./productboxModel');
const Product = require('../product/productModel');
const Provider = require('../provider/providerModel');
const Warehouse = require('../warehouse/warehouseModel');

const getProductBox = async reqParams => {
  const productBox = await ProductBox.findOne({
    where: reqParams,
    include: [{ model: Product, include: [Provider] }, Warehouse],
  });
  if (!productBox) return setResponse(404, 'ProductBox not found.');
  // TODO: Agregar log de cajas
  return setResponse(200, 'ProductBox found.', productBox);
};

const listProductBoxes = async reqQuery => {
  const productBoxes = await ProductBox.findAll(reqQuery);

  return setResponse(200, 'ProductBoxs found.', productBoxes);
};

const createProductBox = async reqBody => {
  const productBox = await ProductBox.create(reqBody);

  return setResponse(201, 'ProductBox created.', productBox);
};

module.exports = {
  getProductBox,
  listProductBoxes,
  createProductBox,
};
