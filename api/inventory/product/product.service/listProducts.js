/* eslint-disable no-param-reassign */
const _ = require('lodash');
const sequelize = require('sequelize');
const { Product, ProductBox, Warehouse } = require('@dbModels');

const { setResponse } = require('../../../utils');

const { warehouseTypes } = require('../../../utils/constants');

const productFields = [
  'code',
  'familyId',
  'subfamilyId',
  'elementId',
  'modelId',
  'providerId',
  'tradename',
];

const listProducts = async reqQuery => {
  if (reqQuery.tradename) {
    reqQuery.tradename = sequelize.where(
      sequelize.fn('LOWER', sequelize.col('tradename')),
      'LIKE',
      `%${reqQuery.tradename}%`,
    );
  }

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
        attributes: { exclude: 'imageBase64' },
      },
    ],
    group: ['warehouseId', 'productId', 'warehouse.id', 'product.id'],
    order: ['productId'],
  });

  let products = await Product.findAll({
    where: _.pick(reqQuery, productFields),
    attributes: { exclude: 'imageBase64' },
    order: ['id'],
    raw: true,
  });

  let j = 0;
  products = products
    .map(product => {
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

const listTradename = async reqQuery => {
  let products = await Product.findAll({
    attributes: ['tradename'],
    group: ['tradename'],
    order: ['tradename'],
  });

  const response = {
    page: reqQuery.page,
    pageSize: reqQuery.pageSize,
    pages: _.ceil(products.length / reqQuery.pageSize),
    rows: products,
  };

  return setResponse(200, 'Tradenames founds.', response);
};

module.exports = {
  listProducts,
  listTradename,
};
