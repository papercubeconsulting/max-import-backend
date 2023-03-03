const { setResponse } = require('@/utils');
const _ = require('lodash');
const sequelize = require('sequelize');
const { Product, ProductBox, Warehouse } = require('@dbModels');
const productFields = [
  'code',
  'familyId',
  'subfamilyId',
  'elementId',
  'modelId',
  'providerId',
  'tradename',
];
const { warehouseTypes } = require('../../../utils/constants');
const getInventoryReport = async reqQuery => {
  const productBoxes = await ProductBox.findAll({
    attributes: [
      'productId',
      'warehouseId',
      [
        sequelize.cast(sequelize.fn('sum', sequelize.col('stock')), 'int'),
        'stock',
      ],
    ],
    include: [
      { model: Warehouse },
      {
        model: Product,
        where: _.pick(reqQuery, productFields),
        attributes: {
          exclude: ['imageBase64', 'secondImageBase64', 'thirdImageBase64'],
        },
      },
    ],
    group: ['warehouseId', 'productId', 'warehouse.id', 'product.id'],
    order: ['productId'],
  });

  let products = await Product.findAll({
    where: _.pick(reqQuery, productFields),
    attributes: {
      exclude: ['imageBase64', 'secondImageBase64', 'thirdImageBase64'],
    },
    order: ['id'],
    raw: true,
  });

  let j = 0;
  products = products.map(product => {
    product.productBoxes = [];
    product.totalStock = 0;
    product.activeStock = 0;
    product.damagedStock = 0;
    while (j < productBoxes.length) {
      if (productBoxes[j].productId === product.id) {
        product.productBoxes.push(productBoxes[j]);
        product.totalStock += productBoxes[j].get('stock');
        product[
          productBoxes[j].warehouse.type === warehouseTypes.DAMAGED
            ? 'damagedStock'
            : 'activeStock'
        ] += productBoxes[j].get('stock');
      } else break;
      j += 1;
    }
    return product;
  });
  const columns = [];
  const rows = [].concat(
    ...products.map(product => {
      return {
        code: product.code,
        family: product.familyName,
        subFamily: product.subfamilyName,
        element: product.elementName,
        model: product.modelName,
        name: product.tradename,
        stock: product.availableStock,
        boxes: product.productBoxes.length,
      };
    }),
  );
  return setResponse(200, 'Inventory Report', { fields: columns, data: rows });
};

module.exports = {
  getInventoryReport,
};
