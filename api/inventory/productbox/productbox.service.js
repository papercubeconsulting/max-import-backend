const {
  ProductBox,
  ProductBoxLog,
  Product,
  Provider,
  Supply,
  Warehouse,
  User,
} = require('@dbModels');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { setResponse } = require('../../utils');
const {
  InventoryOperationError,
  moveProductBoxes,
} = require('../inventoryTransaction.service');

const getProductBox = async reqParams => {
  const productBox = await ProductBox.findOne({
    where: reqParams,
    include: [
      {
        model: Product,
        include: [Provider],
        attributes: {
          exclude: ['imageBase64', 'secondImageBase64', 'thirdImageBase64'],
        },
      },
      Warehouse,
      { model: ProductBox, as: 'originProductBox' },
      { model: User, as: 'explodedByUser', attributes: ['id', 'name', 'lastname'] },
      {
        model: ProductBox,
        as: 'explodedLots',
        include: [
          Warehouse,
          { model: User, as: 'explodedByUser', attributes: ['id', 'name', 'lastname'] },
        ],
      },
      {
        model: ProductBoxLog,
        include: [
          { model: Warehouse, attributes: ['name'] },
          { model: User, attributes: ['name', 'lastname'] },
        ],
      },
    ],
    order: [[{ model: ProductBoxLog }, 'createdAt', 'DESC']],
  });
  if (!productBox) return setResponse(404, 'ProductBox not found.');

  return setResponse(200, 'ProductBox found.', productBox);
};

const listProductBoxes = async reqQuery => {
  const where = { ...reqQuery, inventoryKind: 'PHYSICAL' };
  const productBoxes = await ProductBox.findAll({
    where,
    include: [
      Warehouse,
      Supply,
      { model: Warehouse, as: 'previousWarehouse' },
      { model: ProductBox, as: 'explodedLots', include: [Warehouse] },
    ],
  });

  return setResponse(200, 'ProductBoxs found.', productBoxes);
};

const createProductBox = async reqBody => {
  const productBox = await ProductBox.create(reqBody);

  return setResponse(201, 'ProductBox created.', productBox);
};

const putProductBox = async (reqBody, reqParams, reqUser) => {
  try {
    const [result] = await moveProductBoxes(
      [{ id: Number(reqParams.id), warehouseId: reqBody.warehouseId }],
      reqUser,
    );
    return setResponse(200, 'ProductBox updated.', result);
  } catch (error) {
    if (error instanceof InventoryOperationError)
      return setResponse(error.status, 'ProductBox movement failed.', null, error.userMessage);
    throw error;
  }
};

const putMoveProductBoxes = async (reqBody, reqUser) => {
  try {
    const results = await moveProductBoxes(reqBody.boxes, reqUser);
    return setResponse(200, 'ProductBoxes updated.', results);
  } catch (error) {
    if (error instanceof InventoryOperationError)
      return setResponse(error.status, 'ProductBox movement failed.', null, error.userMessage);
    throw error;
  }
};

const columns = [{ label: 'CODIGO CAJAS', value: 'code' }];

const getAvailableReport = async reqQuery => {
  const productBoxes = await ProductBox.findAll({
    where: {
      stock: { [Op.gt]: 0 },
      inventoryKind: 'PHYSICAL',
    },
    attributes: ['trackingCode', 'boxSize', 'stock', 'createdAt'],
    include: [
      {
        model: Product,
        attributes: [
          'code',
          'familyName',
          'subfamilyName',
          'elementName',
          'modelName',
          'tradename',
          'suggestedPrice',
        ],
      },
      {
        model: Warehouse,
        attributes: ['name'],
      },
      {
        model: Supply,
        attributes: ['code'],
      },
    ],
  });

  const rows = [].concat(
    ...productBoxes.map(productBox => {
      return {
        code: productBox.trackingCode,
        boxSize: productBox.boxSize,
        stock: productBox.stock,
        createdAt: productBox.createdAt,
        productCode: productBox.product.code,
        productFamilyName: productBox.product.familyName,
        productSubfamilyName: productBox.product.subfamilyName,
        productElementName: productBox.product.elementName,
        productModelName: productBox.product.modelName,
        productTradename: productBox.product.tradename,
        productSuggestedPrice: productBox.product.suggestedPrice,
        warehouseName: productBox.warehouse.name,
        supplyName: productBox.supply.code,
      };
    }),
  );
  return setResponse(200, 'Sales found.', { fields: columns, data: rows });
};

const getMovementReport = async reqQuery => {
  const productBoxes = await ProductBoxLog.findAll({
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
      {
        model: ProductBox,
        where: { inventoryKind: 'PHYSICAL' },
        attributes: ['trackingCode', 'stock'],
        include: [
          {
            model: Product,
            attributes: [
              'code',
              'familyName',
              'subfamilyName',
              'elementName',
              'modelName',
              'tradename',
              'suggestedPrice',
            ],
          },
        ],
      },
      {
        model: Warehouse,
        attributes: ['name'],
      },
    ],
  });
  const columns = [{ label: 'CODIGO CAJAS', value: 'code' }];

  const rows = [].concat(
    ...productBoxes.map(productBox => {
      return {
        code: productBox.productBox.trackingCode,
        stock: productBox.productBox.stock,
        log:
          productBox.log === 'Abastecimiento' ? 'Abastecimiento' : 'Movimiento',
        createdAt: productBox.createdAt,
        productCode: productBox.productBox.product.code,
        productFamilyName: productBox.productBox.product.familyName,
        productSubfamilyName: productBox.productBox.product.subfamilyName,
        productElementName: productBox.productBox.product.elementName,
        productModelName: productBox.productBox.product.modelName,
        productTradename: productBox.productBox.product.tradename,
        productSuggestedPrice: productBox.productBox.product.suggestedPrice,
        warehouseName: productBox.warehouse.name,
      };
    }),
  );
  return setResponse(200, 'Product Boxes found found.', {
    fields: columns,
    data: rows,
  });
};

module.exports = {
  getProductBox,
  listProductBoxes,
  createProductBox,
  putProductBox,
  putMoveProductBoxes,
  getAvailableReport,
  getMovementReport,
};
