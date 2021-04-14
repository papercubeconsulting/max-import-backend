const { Product, ProductBox } = require('@dbModels');
const { setResponse } = require('../../../utils');

const deleteProduct = async reqParams => {
  const product = await Product.findByPk(reqParams.id);
  if (!product) return setResponse(400, 'Product does not exist.');

  const productBox = await ProductBox.findOne({
    where: { productId: reqParams.id },
  });
  if (productBox) return setResponse(400, 'Se tiene cajas del producto.');

  return setResponse(200, 'Delete Product.', product);
};

module.exports={
    deleteProduct,
}