const { randomUUID } = require('crypto');
const { Op } = require('sequelize');
const {
  Product,
  ProductBarcode,
  ProductBox,
  Provider,
  UnitTicketPrint,
  Warehouse,
} = require('@dbModels');
const { sequelize } = require('@root/startup/db');
const { setResponse } = require('@/utils');
const {
  productBoxKinds,
  productBoxLifecycle,
  warehouseTypes,
} = require('@/utils/constants');
const {
  ensureProductBarcode,
} = require('../productBarcode/productBarcode.service');
const { getExplodedBoxValidationError } = require('./unitTicketPrint.utils');

const create = async (reqBody, reqUser) => {
  const product = await Product.findByPk(reqBody.productId, {
    include: [Provider],
  });
  if (!product)
    return setResponse(
      404,
      'Product not found.',
      null,
      'Producto no encontrado.',
    );

  let productBox = null;
  if (reqBody.productBoxId) {
    productBox = await ProductBox.findByPk(reqBody.productBoxId);
    if (!productBox || productBox.productId !== product.id)
      return setResponse(
        400,
        'Invalid origin product box.',
        null,
        'La caja origen no pertenece al producto.',
      );
  }

  if (reqBody.warehouseId) {
    const warehouse = await Warehouse.findByPk(reqBody.warehouseId);
    if (!warehouse)
      return setResponse(
        404,
        'Warehouse not found.',
        null,
        'Ubicación no encontrada.',
      );
  }

  if (reqBody.reprintOfId) {
    const original = await UnitTicketPrint.findByPk(reqBody.reprintOfId);
    if (!original || original.productId !== product.id)
      return setResponse(
        400,
        'Invalid reprint reference.',
        null,
        'La impresión original no es válida.',
      );
  }

  const barcode = await ensureProductBarcode(product, { userId: reqUser.id });
  const print = await UnitTicketPrint.create({
    ...reqBody,
    userId: reqUser.id,
    warehouseId: reqBody.warehouseId || (productBox && productBox.warehouseId),
  });
  return setResponse(201, 'Unit ticket print created.', {
    print,
    product,
    productBarcode: barcode,
    originProductBox: productBox,
  });
};

const createExplodedBoxBatch = async (reqBody, reqUser) => {
  const trackingCodes = reqBody.trackingCodes.map((code) =>
    String(code).trim(),
  );
  const transaction = await sequelize.transaction();

  try {
    const productBoxes = await ProductBox.findAll({
      where: { trackingCode: { [Op.in]: trackingCodes } },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const boxesByCode = new Map(
      productBoxes.map((box) => [box.trackingCode, box]),
    );
    const boxIds = productBoxes.map((box) => box.id);
    const explodedLots = boxIds.length
      ? await ProductBox.findAll({
          where: {
            originProductBoxId: { [Op.in]: boxIds },
            inventoryKind: productBoxKinds.EXPLODED,
            lifecycleStatus: productBoxLifecycle.ACTIVE,
          },
          include: [
            {
              model: Warehouse,
              where: { type: warehouseTypes.STORE },
              required: true,
            },
          ],
          order: [
            ['createdAt', 'ASC'],
            ['id', 'ASC'],
          ],
          transaction,
        })
      : [];
    const lotsByOrigin = explodedLots.reduce((current, lot) => {
      if (!current.has(lot.originProductBoxId))
        current.set(lot.originProductBoxId, []);
      current.get(lot.originProductBoxId).push(lot);
      return current;
    }, new Map());

    const invalidBoxes = trackingCodes.reduce((current, trackingCode) => {
      const productBox = boxesByCode.get(trackingCode);
      const reason = getExplodedBoxValidationError(
        productBox,
        productBox ? lotsByOrigin.get(productBox.id) || [] : [],
      );
      if (reason) current.push({ trackingCode, reason });
      return current;
    }, []);

    if (invalidBoxes.length) {
      await transaction.rollback();
      return setResponse(
        400,
        'Invalid exploded boxes.',
        { invalidBoxes },
        'Retire las cajas inválidas y vuelva a intentar.',
      );
    }

    const productIds = [...new Set(productBoxes.map((box) => box.productId))];
    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      attributes: [
        'id',
        'code',
        'modelName',
        'tradename',
        'familyName',
        'subfamilyName',
        'elementName',
        'providerId',
      ],
      include: [{ model: Provider, attributes: ['id', 'name'] }],
      transaction,
    });
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const barcodesByProductId = new Map();
    for (const product of products) {
      const barcode = await ensureProductBarcode(product, {
        userId: reqUser.id,
        transaction,
      });
      barcodesByProductId.set(product.id, barcode);
    }

    const missingProductBox = productBoxes.find(
      (box) =>
        !productsById.has(box.productId) ||
        !barcodesByProductId.has(box.productId),
    );
    if (missingProductBox)
      throw new Error(
        `No se pudo resolver el producto de la caja ${missingProductBox.trackingCode}.`,
      );

    const batchId = randomUUID();
    const orderedBoxes = trackingCodes.map((code) => boxesByCode.get(code));
    const printRows = orderedBoxes.map((productBox) => {
      const explodedLot = lotsByOrigin.get(productBox.id)[0];
      return {
        batchId,
        productId: productBox.productId,
        productBoxId: productBox.id,
        warehouseId: explodedLot.warehouseId,
        quantity: productBox.boxSize,
        userId: reqUser.id,
      };
    });
    const prints = await UnitTicketPrint.bulkCreate(printRows, { transaction });

    const boxes = orderedBoxes.map((productBox, index) => {
      const product = productsById.get(productBox.productId);
      const explodedLot = lotsByOrigin.get(productBox.id)[0];
      const productBarcode = barcodesByProductId.get(productBox.productId);
      return {
        trackingCode: productBox.trackingCode,
        boxSize: productBox.boxSize,
        productBoxId: productBox.id,
        warehouseId: explodedLot.warehouseId,
        warehouseName: explodedLot.warehouse.name,
        printId: prints[index].id,
        product: product.get({ plain: true }),
        productBarcode,
      };
    });

    await transaction.commit();
    return setResponse(201, 'Unit ticket print batch created.', {
      batchId,
      totalBoxes: boxes.length,
      totalTickets: boxes.reduce((sum, box) => sum + box.boxSize, 0),
      boxes,
    });
  } catch (error) {
    await transaction.rollback();
    return setResponse(
      400,
      'Unit ticket print batch failed.',
      null,
      error.message || 'No se pudo registrar la impresión masiva.',
    );
  }
};

const read = async (reqParams) => {
  const print = await UnitTicketPrint.findByPk(reqParams.id, {
    include: [
      { model: Product, include: [Provider, ProductBarcode] },
      ProductBox,
      Warehouse,
    ],
  });
  if (!print)
    return setResponse(
      404,
      'Unit ticket print not found.',
      null,
      'Impresión no encontrada.',
    );
  return setResponse(200, 'Unit ticket print found.', print);
};

const list = async (reqQuery) => {
  const prints = await UnitTicketPrint.findAll({
    where: reqQuery,
    include: [Product, ProductBox, Warehouse],
    order: [['createdAt', 'DESC']],
  });
  return setResponse(200, 'Unit ticket prints found.', prints);
};

module.exports = { create, createExplodedBoxBatch, read, list };
