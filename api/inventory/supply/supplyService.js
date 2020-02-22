const _ = require('lodash');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

const { setResponse, paginate } = require('../../utils');

const { Supply, SuppliedProduct } = require('./supplyModel');
const Product = require('../product/productModel');
const Provider = require('../provider/providerModel');
const Warehouse = require('../warehouse/warehouseModel');

const PRODUCT_NESTED_ATTRIBUTES = [
  'id',
  'familyName',
  'subfamilyName',
  'elementName',
  'modelName',
  'code',
  'compatibility',
  'suggestedPrice',
];

const SUPPLIED_PRODUCT_NESTED_ATTRIBUTES = [
  'quantity',
  'boxSize',
  'status',
  'suppliedQuantity',
];

const readSupply = async reqParams => {
  const supply = await Supply.findByPk(reqParams.id, {
    include: [
      Warehouse,
      Provider,
      {
        model: SuppliedProduct,
        include: Product,
      },
    ],
  });
  if (!supply) return setResponse(400, 'Supply not found.');

  return setResponse(200, 'Supply found.', supply);
};

const listSupplies = async reqQuery => {
  const supplies = await Supply.findAndCountAll({
    where: {
      createdAt: {
        [Op.between]: [
          moment
            .tz(moment.utc(reqQuery.from).format('YYYY-MM-DD'), 'America/Lima')
            .startOf('day')
            .toDate(),
          moment
            .tz(moment.utc(reqQuery.to).format('YYYY-MM-DD'), 'America/Lima')
            .endOf('day')
            .toDate(),
        ],
      },
    },
    order: [['createdAt', 'DESC']],
    include: [
      Warehouse,
      Provider,
      {
        model: SuppliedProduct,
        include: Product,
      },
    ],
    distinct: true,
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });
  supplies.page = reqQuery.page;
  supplies.pageSize = reqQuery.pageSize;
  supplies.pages = _.ceil(supplies.count / supplies.pageSize);
  return setResponse(200, 'Supplies found.', supplies);
};

const createSupply = async reqBody => {
  let supply = await Supply.create(_.omit(reqBody, ['suppliedProducts']));

  // * Create nested entities
  const suppliedProducts = await SuppliedProduct.bulkCreate(
    reqBody.suppliedProducts.map(data => {
      return { ...data, supplyId: supply.id };
    }),
  );

  // * Update object with nested entities
  supply = await Supply.findByPk(supply.id, {
    include: [
      Warehouse,
      Provider,
      {
        model: SuppliedProduct,
        include: Product,
      },
    ],
  });

  return setResponse(201, 'Supply created.', supply);
};

const deleteSupply = async reqParams => {
  const supply = await Supply.destroy({ where: { id: reqParams.id } });
  if (!supply) return setResponse(400, 'Supply not found.');

  return setResponse(200, 'Supply deleted.');
};

module.exports = {
  readSupply,
  listSupplies,
  createSupply,
  deleteSupply,
};
