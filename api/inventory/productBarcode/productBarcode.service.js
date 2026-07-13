const { Product, ProductBarcode, Provider } = require('@dbModels');
const { setResponse } = require('@/utils');

const productAttributes = {
  exclude: ['imageBase64', 'secondImageBase64', 'thirdImageBase64'],
};

const ensureProductBarcode = async (product, options = {}) => {
  if (!product) return null;
  const [barcode] = await ProductBarcode.findOrCreate({
    where: { productId: product.id, type: 'UNIT_PRODUCT', isActive: true },
    defaults: {
      barcode: ProductBarcode.buildUnitBarcode(product.id),
      productCodeSnapshot: product.code,
      productId: product.id,
      type: 'UNIT_PRODUCT',
      isActive: true,
      createdBy: options.userId,
    },
    transaction: options.transaction,
  });
  return barcode;
};

const getByProductId = async (reqParams, reqUser) => {
  const product = await Product.findByPk(reqParams.productId, {
    attributes: productAttributes,
    include: [Provider],
  });
  if (!product) return setResponse(404, 'Product not found.', null, 'Producto no encontrado.');
  const barcode = await ensureProductBarcode(product, { userId: reqUser.id });
  return setResponse(200, 'Product barcode found.', { ...barcode.get(), product });
};

const getByCode = async reqParams => {
  const barcode = await ProductBarcode.findOne({
    where: { barcode: reqParams.barcode, type: 'UNIT_PRODUCT', isActive: true },
    include: [{ model: Product, attributes: productAttributes, include: [Provider] }],
  });
  if (!barcode)
    return setResponse(404, 'Product barcode not found.', null, 'Código de producto no encontrado.');
  return setResponse(200, 'Product barcode found.', barcode);
};

module.exports = { ensureProductBarcode, getByProductId, getByCode };
