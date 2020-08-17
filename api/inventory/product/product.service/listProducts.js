/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

const { setResponse, paginate } = require('../../../utils');

const { Product } = require('./../product.model');
const { ProductBox } = require('../../productbox/productbox.model');
const { Warehouse } = require('../../warehouse/warehouse.model');

const { warehouseTypes } = require('../../../utils/constants');

const listProducts = async reqQuery => {
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
        where: _.pick(reqQuery, [
          'code',
          'familyId',
          'subfamilyId',
          'elementId',
          'modelId',
        ]),
        attributes: { exclude: 'imageBase64' },
      },
    ],
    group: ['warehouseId', 'productId', 'warehouse.id', 'product.id'],
    order: ['productId'],
  });

  let products = await Product.findAll({
    where: _.pick(reqQuery, [
      'code',
      'familyId',
      'subfamilyId',
      'elementId',
      'modelId',
      'providerId',
    ]),
    attributes: { exclude: 'imageBase64' },
    order: ['id'],
    raw: true,
  });

  let j = 0;
  products = products
    .map((product, i) => {
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
    })
    .filter(product => {
      if (reqQuery.stock === 'yes') return product.activeStock;
      if (reqQuery.stock === 'no') return !product.activeStock;
      return true;
    });

  const response = {
    page: reqQuery.page,
    pageSize: reqQuery.pageSize,
    pages: _.ceil(products.length / reqQuery.pageSize),
    rows: products,
  };

  const skip = reqQuery.pageSize * (reqQuery.page - 1);

  response.rows = products
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(skip, skip + reqQuery.pageSize)
    .map(product => Product.aggregateStock(product));
  response.count = response.rows.length;

  return setResponse(200, 'Products found.', response);
};

module.exports = {
  listProducts,
};
