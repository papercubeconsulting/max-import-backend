const { Product, ProductBox, SuppliedProduct, ProformaProduct } = require('@dbModels');
const { setResponse } = require('../../../utils');

const deleteProduct = async reqParams => {
  const product = await Product.findByPk(reqParams.id);
  if (!product) return setResponse(400, 'Product does not exist.');

  const productBox = await ProductBox.findOne({
    where: { productId: reqParams.id },
  });
  if (productBox) return setResponse(400, 'Se tiene cajas del producto.');

  const suppliedProduct = await SuppliedProduct.findOne({
    where: { productId: reqParams.id },
  });
  if (suppliedProduct)
    return setResponse(400, 'Se tiene un proceso de abastecimiento pendiente.');

  const proformaProduct = await ProformaProduct.findOne({
    where: { productId: reqParams.id },
  });
  if (proformaProduct)
    return setResponse(400, 'Se tiene el producto en una proforma.');

  const productDelete = await Product.destroy({ where: { id: reqParams.id } });

  return setResponse(200, 'Delete Product.', product);
};

module.exports={
    deleteProduct,
}