const _ = require('lodash');
const sequelize = require('sequelize');
const { Product, ProductBox, Warehouse } = require('@dbModels');
const { setResponse } = require('@/utils');

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
    const modifiedProduct = { ...product }; // Cloning the product object
    modifiedProduct.productBoxes = [];
    modifiedProduct.totalStock = 0;
    modifiedProduct.activeStock = 0;
    modifiedProduct.damagedStock = 0;
    modifiedProduct.storeStock = 0;
    modifiedProduct.warehouseStock = 0;

    while (j < productBoxes.length) {
      if (productBoxes[j].productId === modifiedProduct.id) {
        modifiedProduct.productBoxes.push(productBoxes[j]);
        modifiedProduct.totalStock += productBoxes[j].get('stock');
        modifiedProduct[
          productBoxes[j].warehouse.type === warehouseTypes.DAMAGED
            ? 'damagedStock'
            : 'activeStock'
        ] += productBoxes[j].get('stock');

        if (productBoxes[j].warehouse.type === warehouseTypes.STORE) {
          modifiedProduct.storeStock += productBoxes[j].get('stock');
        }
        if (productBoxes[j].warehouse.type === warehouseTypes.WAREHOUSE) {
          modifiedProduct.warehouseStock += productBoxes[j].get('stock');
        }
      } else break;
      j += 1;
    }
    return modifiedProduct;
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
        stockStore: product.storeStock,
        stockWarehouse: product.warehouseStock,
        boxes: product.productBoxes.length,
      };
    }),
  );
  return setResponse(200, 'Inventory Report', { fields: columns, data: rows });
};

module.exports = {
  getInventoryReport,
};
