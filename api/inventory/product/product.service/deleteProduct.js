const {
  Product,
  Model,
  ProductBox,
  SuppliedProduct,
  ProformaProduct,
} = require('@dbModels');
const { setResponse } = require('../../../utils');

const deleteProduct = async reqParams => {
  const product = await Product.findByPk(reqParams.id);
  if (!product) return setResponse(400, 'Product does not exist.');

  const productBox = await ProductBox.findOne({
    where: { productId: reqParams.id },
  });
  if (productBox)
    return setResponse(
      400,
      'No es posible eliminar este item dado que tiene stock.',
    );

  const suppliedProduct = await SuppliedProduct.findOne({
    where: { productId: reqParams.id },
  });
  if (suppliedProduct)
    return setResponse(
      400,
      'No es posible eliminar este item dado que tiene stock.',
    );

  const proformaProduct = await ProformaProduct.findOne({
    where: { productId: reqParams.id },
  });
  if (proformaProduct)
    return setResponse(
      400,
      'No es posible eliminar este item dado que tiene stock.',
    );

  await Product.destroy({ where: { id: reqParams.id } });
  await Model.destroy({ where: { id: product.modelId } });

  return setResponse(200, 'Delete Product.', product);
};

module.exports = {
  deleteProduct,
};
