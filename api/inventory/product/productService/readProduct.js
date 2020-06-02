const { Op } = require('sequelize');

const { setResponse } = require('../../../utils');

const Product = require('./../productModel');
const Provider = require('../../provider/providerModel');
const ProductBox = require('../../productbox/productboxModel');
const Warehouse = require('../../warehouse/warehouseModel');

const readProduct = async reqParams => {
  const product = await Product.findByPk(reqParams.id, {
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

module.exports = {
  readProduct,
};
