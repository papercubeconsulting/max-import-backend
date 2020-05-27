const _ = require('lodash');
const { Op } = require('sequelize');

const { setResponse, paginate } = require('../../../utils');

const Product = require('./../productModel');
const ProductBox = require('../../productbox/productboxModel');
const Warehouse = require('../../warehouse/warehouseModel');

// TODO: Considerar stock nulo

const listProducts = async reqQuery => {
  const products = await Product.findAndCountAll({
    where: _.pick(reqQuery, [
      'code',
      'familyId',
      'subfamilyId',
      'elementId',
      'modelId',
    ]),
    attributes: { exclude: 'imageBase64' },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: ProductBox,
        where: reqQuery.stock === 'yes' ? { stock: { [Op.gt]: 0 } } : undefined,
        attributes: ['id', 'stock'],
        include: [
          {
            model: Warehouse,
            attributes: ['type', 'id', 'name'],
            raw: true,
          },
        ],
        raw: true,
        // required: false,
      },
    ],
    distinct: true,

    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });
  products.rows = products.rows.map(product => product.aggregateStock());
  products.page = reqQuery.page;
  products.pageSize = reqQuery.pageSize;
  products.pages = _.ceil(products.count / products.pageSize);

  return setResponse(200, 'Products found.', products);
};

module.exports = {
  listProducts,
};
