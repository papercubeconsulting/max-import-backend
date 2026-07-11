const { Product, ProductGroup } = require('@dbModels');

const {
  setResponse,
  PRODUCT_GROUP_PREFIXES,
  isAllowedGroupCode,
} = require('../../../utils');

const updateProduct = async (reqParams, reqBody) => {
  const product = await Product.findByPk(reqParams.id);
  if (!product) return setResponse(400, 'Product does not exist.');

  if (reqBody.groupId !== undefined && reqBody.groupId !== null) {
    const productGroup = await ProductGroup.findByPk(reqBody.groupId);
    if (!productGroup) return setResponse(404, 'Product group not found.');
    if (!isAllowedGroupCode(productGroup.code))
      return setResponse(
        400,
        `Product group code must use one of these formats: ${PRODUCT_GROUP_PREFIXES.map(
          prefix => `${prefix}-XX`,
        ).join(
          ', ',
        )}.`,
      );
  }

  const updateData = { ...reqBody };
  if (reqBody.cost !== undefined || reqBody.suggestedPrice !== undefined) {
    const cost =
      reqBody.cost !== undefined ? reqBody.cost : product.getDataValue('cost');
    const suggestedPrice =
      reqBody.suggestedPrice !== undefined
        ? reqBody.suggestedPrice
        : product.getDataValue('suggestedPrice');

    if (cost === 0)
      return setResponse(400, 'Cost must be greater than 0');

    // fixed to 4 decimals lets has in the front a percentage with two decimals
    updateData.margin = (suggestedPrice / cost).toFixed(4);
  }

  await product.update(updateData);

  return setResponse(200, 'Product updated.', product);
};

module.exports = {
  updateProduct,
};
