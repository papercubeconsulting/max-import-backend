const { Product } = require('@dbModels');

const { setResponse } = require('../../../utils');

const updateProduct = async (reqParams, reqBody) => {
  const product = await Product.findByPk(reqParams.id);
  if (!product) return setResponse(400, 'Product does not exist.');

  if (reqBody.cost === 0)
    return setResponse(400, 'Cost must be greater than 0');

  // fixed to 4 decimals lets has in the front a percentage with two decimals
  const margin = (reqBody.suggestedPrice / reqBody.cost).toFixed(4);

  await product.update({ ...reqBody, margin });

  return setResponse(201, 'Product created.', product);
};

module.exports = {
  updateProduct,
};
