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
  const productBoxes = await ProductBox.findAll({
    where: reqQuery,
    include: [Warehouse, Supply, { model: Warehouse, as: 'previousWarehouse' }],
  });

  return setResponse(200, 'ProductBoxs found.', productBoxes);
};

const createProductBox = async reqBody => {
  const productBox = await ProductBox.create(reqBody);

  return setResponse(201, 'ProductBox created.', productBox);
};

const putProductBox = async (reqBody, reqParams, reqUser) => {
  const productBox = await ProductBox.findByPk(reqParams.id);
  if (!productBox) return setResponse(404, 'ProductBox not found.');
  if (reqBody.warehouseId) {
    reqBody.previousWarehouseId = productBox.dataValues.warehouseId;
    const warehouse = await Warehouse.findByPk(reqBody.warehouseId);
    if (!warehouse) return setResponse(404, 'Warehouse not found.');
  }
  await productBox.update(reqBody);
  productBox.registerLog(reqBody.message, reqUser);
  return setResponse(200, 'ProductBox updated.', productBox);
};

const putMoveProductBoxes = async (reqBody, reqUser) => {
  let boxes = reqBody.boxes;
  for (let i = 0; i < boxes.length; i++) {
    console.log(boxes[i].id);
    const productBox = await ProductBox.findByPk(boxes[i].id);
    if (!productBox) return setResponse(404, 'ProductBox not found.');
  }
  for (let i = 0; i < boxes.length; i++) {
    const productBox = await ProductBox.findByPk(boxes[i].id);
    let item = {
      warehouseId: boxes[i].warehouseId,
      previousWarehouseId: boxes[i].previousWarehouseId,
    };
    await productBox.update(item);
    productBox.registerLog(reqBody.message, reqUser);
  }
  return setResponse(200, 'ProductBox updated.', boxes);
};

const columns = [{ label: 'CODIGO CAJAS', value: 'code' }];

const getAvailableReport = async reqQuery => {
  const productBoxes = await ProductBox.findAll({
    where: {
      stock: { [Op.gt]: 0 },
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
        attributes: ['trackingCode'],
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
