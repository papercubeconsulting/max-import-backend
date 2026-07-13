const winston = require('winston');
const { Op } = require('sequelize');
const {
  Dispatch,
  DispatchedProduct,
  InventoryMovement,
  ProductBarcode,
  ProductBox,
  Warehouse,
} = require('@dbModels');
const { sequelize } = require('@root/startup/db');
const { DISPATCH, warehouseTypes } = require('@/utils/constants');
const { setResponse } = require('@/utils');
const { allocateStock } = require('@/inventory/unitInventory.utils');

const fail = message => {
  const error = new Error(message);
  error.userMessage = message;
  throw error;
};

const allocateUnitLots = async ({ productId, warehouseId, quantity }, transaction) => {
  const lots = await ProductBox.findAll({
    where: {
      productId,
      warehouseId,
      inventoryKind: 'EXPLODED',
      lifecycleStatus: 'ACTIVE',
      stock: { [Op.gt]: 0 },
    },
    order: [['createdAt', 'ASC'], ['id', 'ASC']],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const allocation = allocateStock(lots, quantity);
  const allocations = allocation.allocations.map(item => ({
    productBox: item.lot,
    quantity: item.quantity,
    stockBefore: item.lot.stock,
  }));
  const { remaining } = allocation;
  if (remaining > 0) fail('La tienda no tiene stock unitario suficiente para este despacho.');
  return allocations;
};

const postDispatchProductBox = async (reqParams, reqBody, reqUser) => {
  const transaction = await sequelize.transaction();
  try {
    const dispatchedProduct = await DispatchedProduct.findByPk(
      reqParams.dispatchedProductId,
      {
        include: [{ model: Dispatch, required: true }],
        transaction,
        lock: transaction.LOCK.UPDATE,
      },
    );
    if (!dispatchedProduct || dispatchedProduct.dispatchId !== Number(reqParams.id))
      fail('Producto de despacho no encontrado.');
    if (dispatchedProduct.dispatch.status !== DISPATCH.STATUS.OPEN.value)
      fail('El despacho está bloqueado o ya fue completado.');
    if (reqBody.quantity <= 0)
      fail('La cantidad debe ser mayor a cero.');
    if (dispatchedProduct.quantity - dispatchedProduct.dispatched < reqBody.quantity)
      fail('La cantidad es mayor a la pendiente de despacho.');

    let allocations;
    if (reqBody.productBarcode) {
      const [barcode, warehouse] = await Promise.all([
        ProductBarcode.findOne({
          where: { barcode: reqBody.productBarcode, type: 'UNIT_PRODUCT', isActive: true },
          transaction,
        }),
        Warehouse.findByPk(reqBody.warehouseId, { transaction }),
      ]);
      if (!barcode) fail('El código de producto no fue encontrado.');
      if (barcode.productId !== dispatchedProduct.productId)
        fail('La etiqueta corresponde a un producto distinto al requerido.');
      if (!warehouse || warehouse.type !== warehouseTypes.STORE)
        fail('Debe seleccionar una tienda válida.');
      allocations = await allocateUnitLots(
        {
          productId: dispatchedProduct.productId,
          warehouseId: warehouse.id,
          quantity: reqBody.quantity,
        },
        transaction,
      );
    } else {
      const productBox = await ProductBox.findByPk(reqBody.productBoxId, {
        include: [{ model: Warehouse, required: true }],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!productBox) fail('Caja no encontrada.');
      if (productBox.inventoryKind !== 'PHYSICAL' || productBox.lifecycleStatus !== 'ACTIVE')
        fail('La caja fue explotada y ya no puede despacharse como caja física.');
      if ([warehouseTypes.DAMAGED, warehouseTypes.ADJUSTMENT].includes(productBox.warehouse.type))
        fail('La caja pertenece a una ubicación no disponible.');
      if (productBox.productId !== dispatchedProduct.productId)
        fail('La caja contiene un producto distinto al requerido.');
      if (productBox.stock < reqBody.quantity)
        fail('La caja no cuenta con unidades suficientes.');
      allocations = [
        { productBox, quantity: reqBody.quantity, stockBefore: productBox.stock },
      ];
    }

    for (const allocation of allocations) {
      await dispatchedProduct.createDispatchedProductBox(
        {
          productBoxId: allocation.productBox.id,
          quantity: allocation.quantity,
          dispatcherId: reqUser.id,
          warehouseId: allocation.productBox.warehouseId,
        },
        { transaction },
      );
      await InventoryMovement.create(
        {
          type: 'DISPATCH',
          quantity: allocation.quantity,
          productId: dispatchedProduct.productId,
          sourceProductBoxId: allocation.productBox.id,
          fromWarehouseId: allocation.productBox.warehouseId,
          sourceStockBefore: allocation.stockBefore,
          sourceStockAfter: allocation.stockBefore - allocation.quantity,
          userId: reqUser.id,
          dispatchId: dispatchedProduct.dispatchId,
          description: 'Despacho de producto',
        },
        { transaction },
      );
    }

    await dispatchedProduct.setLastDispatcher(reqUser, { transaction });
    await dispatchedProduct.dispatch.setDispatcher(reqUser, { transaction });
    await transaction.commit();
    await dispatchedProduct.reload();
    return setResponse(200, 'Product dispatched.', dispatchedProduct);
  } catch (error) {
    winston.error(error);
    await transaction.rollback();
    return setResponse(400, 'Dispatchment failed.', null, error.userMessage || error.message);
  }
};

module.exports = { postDispatchProductBox };
