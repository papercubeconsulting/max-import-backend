const { setResponse } = require('../../utils');

const { ProductBox, ProductBoxLog } = require('./productboxModel');
const { Product } = require('../product/productModel');
const { Provider } = require('../provider/providerModel');
const { Warehouse } = require('../warehouse/warehouseModel');

const getProductBox = async reqParams => {
  const productBox = await ProductBox.findOne({
    where: reqParams,
    include: [
      {
        model: Product,
        include: [Provider],
        attributes: { exclude: 'imageBase64' },
      },
      Warehouse,
      {
        model: ProductBoxLog,
        include: [{ model: Warehouse, attributes: ['name'] }],
      },
    ],
    order: [[{ model: ProductBoxLog }, 'createdAt', 'DESC']],
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

const putProductBox = async (reqBody, reqParams, reqUser) => {
  const productBox = await ProductBox.findByPk(reqParams.id);
  if (!productBox) return setResponse(404, 'ProductBox not found.');
  if (reqBody.warehouseId) {
    const warehouse = await Warehouse.findByPk(reqBody.warehouseId);
    if (!warehouse) return setResponse(404, 'Warehouse not found.');
  }
  await productBox.update(reqBody);
  productBox.registerLog(reqBody.message, reqUser);
  return setResponse(200, 'ProductBox updated.', productBox);
};

module.exports = {
  getProductBox,
  listProductBoxes,
  createProductBox,
  putProductBox,
};