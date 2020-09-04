const { Op } = require('sequelize');
const { Product, Provider, ProductBox, Warehouse } = require('@dbModels');

const { setResponse } = require('../../../utils');

const readProduct = async reqParams => {
  const product = await Product.scope('full').findByPk(reqParams.id, {
    include: [
      {
        model: ProductBox,
        where: { stock: { [Op.gt]: 0 } },
        attributes: ['id', 'stock', 'boxSize'],
        include: [
          {
            model: Warehouse,
            attributes: ['type', 'id', 'name'],
          },
        ],
        required: false,
      },
      Provider,
    ],
  });
  if (!product) return setResponse(404, 'Product not found.');

  return setResponse(
    200,
    'Product found.',
    Product.aggregateStock(product.get(), true),
  );
};

const readProductNoStock = async reqParams => {
  const product = await Product.findByPk(reqParams.id, { include: [Provider] });
  if (!product) return setResponse(404, 'Product not found.');

  return setResponse(200, 'Product found.', product);
};

module.exports = {
  readProduct,
  readProductNoStock,
};
