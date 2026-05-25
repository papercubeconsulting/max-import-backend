const { Op } = require('sequelize');
const { Product } = require('@dbModels');

const { setResponse } = require('../../../utils');

const listProductChangeOptions = async reqQuery => {
  const currentProduct = await Product.findOne({
    where: { code: reqQuery.code },
  });

  if (!currentProduct) return setResponse(404, 'Product not found.');

  if (!currentProduct.groupId)
    return setResponse(200, 'Product change options found.', {
      product: currentProduct,
      requiredStock: reqQuery.stock,
      rows: [],
    });

  const products = await Product.findAll({
    where: {
      groupId: currentProduct.groupId,
      id: { [Op.ne]: currentProduct.id },
    },
    attributes: {
      exclude: ['imageBase64', 'secondImageBase64', 'thirdImageBase64'],
    },
    order: [['availableStock', 'DESC'], ['code', 'ASC']],
  });

  const requiredStock = Number(reqQuery.stock);
  const rows = products
    .map(product => {
      const plainProduct = product.get();
      return {
        ...plainProduct,
        requiredStock,
        hasEnoughStock: plainProduct.availableStock >= requiredStock,
      };
    })
    .sort((a, b) => {
      if (a.hasEnoughStock !== b.hasEnoughStock)
        return a.hasEnoughStock ? -1 : 1;
      return b.availableStock - a.availableStock;
    });

  return setResponse(200, 'Product change options found.', {
    product: currentProduct,
    requiredStock,
    rows,
  });
};

module.exports = {
  listProductChangeOptions,
};
