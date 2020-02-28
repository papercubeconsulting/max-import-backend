/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const _ = require('lodash');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const winston = require('winston');

const sequelize = require(`${process.cwd()}/startup/db`);

const { setResponse, paginate } = require('../../../utils');
const { status } = require('../../../utils/constants');

const { Supply, SuppliedProduct } = require('../supplyModel');
const Product = require('../../product/productModel');
const Provider = require('../../provider/providerModel');
const Warehouse = require('../../warehouse/warehouseModel');

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
  if (!supply) return setResponse(404, 'Supply not found.');

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
  let supply = await Supply.create(reqBody, {
    include: [SuppliedProduct],
  });

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

// ? Servicio para actualiza campos del abastecimiento y añadir/remover productos
// ? El abastecimiento debe estar sin atender
const updateSupply = async (reqBody, reqParams, validatedData) => {
  const t = await sequelize.transaction();

  try {
    await Supply.update(_.omit(reqBody, ['suppliedProducts']), {
      where: { id: reqParams.id },
      transaction: t,
    });

    const promises = [];

    // * Remove items
    validatedData.deleteSuppliedProducts.reduce((acc, cur) => {
      acc.push(
        SuppliedProduct.destroy({ where: { id: cur.id }, transaction: t }),
      );
      return acc;
    }, promises);

    // * Update items (cantidad de cajas)
    validatedData.updateSuppliedProducts.reduce((acc, cur) => {
      const queryProd = reqBody.suppliedProducts.find(
        qProd =>
          cur.productId === qProd.productId && cur.boxSize === qProd.boxSize,
      );
      acc.push(
        SuppliedProduct.update(
          { quantity: queryProd.quantity },
          { where: { id: cur.id }, transaction: t },
        ),
      );
      return acc;
    }, promises);

    // * Crear nuevos items
    promises.push(
      SuppliedProduct.bulkCreate(
        validatedData.newSuppliedProducts.map(row => {
          row.supplyId = reqParams.id;
          return row;
        }),
        { transaction: t },
      ),
    );

    await Promise.all(promises);

    // If the execution reaches this line, no errors were thrown.
    // We commit the transaction.
    await t.commit();

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

    return setResponse(200, 'Supply updated.', supply);
  } catch (error) {
    winston.error(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Supply updated failed.');
  }
};

const deleteSupply = async reqParams => {
  const supply = await Supply.destroy({ where: { id: reqParams.id } });
  if (!supply) return setResponse(404, 'Supply not found.');

  return setResponse(200, 'Supply deleted.');
};

module.exports = {
  readSupply,
  listSupplies,
  createSupply,
  validateUpdateSupply: require('./validateUpdateSupply'),
  updateSupply,
  deleteSupply,
};
