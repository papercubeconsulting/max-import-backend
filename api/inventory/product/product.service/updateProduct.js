const { Product } = require('@dbModels');

const { setResponse } = require('../../../utils');

const updateProduct = async (reqParams, reqBody) => {
  const product = await Product.findByPk(reqParams.id);
  if (!product) return setResponse(400, 'Product does not exist.');

  await product.update(reqBody);

  return setResponse(201, 'Product created.', product);
};

module.exports = {
  updateProduct,
};
