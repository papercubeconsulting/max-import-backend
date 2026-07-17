const { Op, fn, col, cast } = require('sequelize');
const {
  InventoryMovement,
  Product,
  ProductBox,
  Provider,
  Supply,
  SuppliedProduct,
  SupplyLog,
  Warehouse,
} = require('@dbModels');
const { sequelize } = require('@root/startup/db');
const {
  PRODUCTBOX_UPDATES,
  supplyStatus,
  supplyTypes,
  warehouseTypes,
} = require('@/utils/constants');
const { setResponse } = require('@/utils');

class StoreReturnError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const requestedUnitsByProduct = (suppliedProducts) =>
  suppliedProducts.reduce((result, item) => {
    const productId = Number(item.productId);
    const units = Number(item.quantity) * Number(item.boxSize);
    result.set(productId, (result.get(productId) || 0) + units);
    return result;
  }, new Map());

const loadUnitStockByProduct = async (warehouseId, productIds, transaction) => {
  const rows = await ProductBox.findAll({
    attributes: ['productId', [cast(fn('sum', col('stock')), 'int'), 'stock']],
    where: {
      warehouseId,
      productId: { [Op.in]: productIds },
      inventoryKind: 'EXPLODED',
      lifecycleStatus: 'ACTIVE',
      stock: { [Op.gt]: 0 },
    },
    group: ['productId'],
    raw: true,
    transaction,
  });
  return new Map(rows.map((row) => [Number(row.productId), Number(row.stock)]));
};

const validateStoreReturnRequest = async (body, transaction) => {
  if (body.type !== supplyTypes.STORE_RETURN) return null;
  if (body.providerId !== null && body.providerId !== undefined)
    throw new StoreReturnError(
      'Una devolución de tienda no debe tener proveedor.',
    );

  const [sourceWarehouse, destinationWarehouse] = await Promise.all([
    Warehouse.findByPk(body.sourceWarehouseId, { transaction }),
    Warehouse.findByPk(body.warehouseId, { transaction }),
  ]);
  if (!sourceWarehouse || sourceWarehouse.type !== warehouseTypes.STORE)
    throw new StoreReturnError('Debe seleccionar una Tienda origen válida.');
  if (
    !destinationWarehouse ||
    destinationWarehouse.type !== warehouseTypes.WAREHOUSE
  )
    throw new StoreReturnError('Debe seleccionar un Almacén destino válido.');
  if (sourceWarehouse.id === destinationWarehouse.id)
    throw new StoreReturnError(
      'La Tienda origen y el Almacén destino deben ser distintos.',
    );

  const requested = requestedUnitsByProduct(body.suppliedProducts || []);
  const productIds = [...requested.keys()];
  const products = await Product.findAll({
    where: { id: { [Op.in]: productIds } },
    transaction,
  });
  if (products.length !== productIds.length)
    throw new StoreReturnError('Uno de los productos seleccionados no existe.');

  const available = await loadUnitStockByProduct(
    sourceWarehouse.id,
    productIds,
    transaction,
  );
  const shortfalls = productIds
    .map((productId) => ({
      product: products.find((item) => item.id === productId),
      requested: requested.get(productId),
      available: available.get(productId) || 0,
    }))
    .filter((item) => item.requested > item.available);
  if (shortfalls.length) {
    const detail = shortfalls
      .map(
        (item) =>
          `${item.product.code}: solicita ${item.requested}, disponible ${item.available}`,
      )
      .join(' | ');
    throw new StoreReturnError(
      `Stock unitario insuficiente en la tienda. ${detail}`,
    );
  }
  return {
    sourceWarehouse,
    destinationWarehouse,
    products,
    requested,
    available,
  };
};

const getStoreReturnAvailability = async (reqQuery) => {
  const warehouse = await Warehouse.findByPk(reqQuery.warehouseId);
  if (!warehouse || warehouse.type !== warehouseTypes.STORE)
    return setResponse(
      400,
      'Invalid store.',
      null,
      'Debe seleccionar una Tienda válida.',
    );

  const where = {
    warehouseId: warehouse.id,
    inventoryKind: 'EXPLODED',
    lifecycleStatus: 'ACTIVE',
    stock: { [Op.gt]: 0 },
  };
  if (reqQuery.productId) where.productId = reqQuery.productId;
  const lots = await ProductBox.findAll({
    where,
    include: [{ model: Product, include: [Provider] }],
    order: [
      ['productId', 'ASC'],
      ['createdAt', 'ASC'],
      ['id', 'ASC'],
    ],
  });
  const products = Object.values(
    lots.reduce((result, lot) => {
      if (!result[lot.productId])
        result[lot.productId] = {
          productId: lot.productId,
          product: lot.product,
          stock: 0,
          lotCount: 0,
        };
      result[lot.productId].stock += lot.stock;
      result[lot.productId].lotCount += 1;
      return result;
    }, {}),
  ).sort((a, b) =>
    String(a.product.code).localeCompare(String(b.product.code)),
  );
  return setResponse(200, 'Store return availability.', {
    warehouse,
    products,
  });
};

const attendStoreReturn = async (reqBody, reqParams, reqUser) => {
  const transaction = await sequelize.transaction();
  try {
    const suppliedProduct = await SuppliedProduct.findByPk(
      reqParams.idSuppliedProduct,
      { transaction, lock: transaction.LOCK.UPDATE },
    );
    if (!suppliedProduct || suppliedProduct.supplyId !== Number(reqParams.id))
      throw new StoreReturnError('Producto de devolución no encontrado.', 404);
    const supply = await Supply.findByPk(suppliedProduct.supplyId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!supply || supply.type !== supplyTypes.STORE_RETURN)
      throw new StoreReturnError(
        'La solicitud no es una devolución de tienda.',
      );
    if (supply.status !== supplyStatus.PENDING)
      throw new StoreReturnError('La devolución ya no está pendiente.');

    const [sourceWarehouse, destinationWarehouse] = await Promise.all([
      Warehouse.findByPk(supply.sourceWarehouseId, {
        transaction,
        lock: transaction.LOCK.SHARE,
      }),
      Warehouse.findByPk(supply.warehouseId, {
        transaction,
        lock: transaction.LOCK.SHARE,
      }),
    ]);
    if (!sourceWarehouse || sourceWarehouse.type !== warehouseTypes.STORE)
      throw new StoreReturnError('La Tienda origen ya no es válida.');
    if (
      !destinationWarehouse ||
      destinationWarehouse.type !== warehouseTypes.WAREHOUSE
    )
      throw new StoreReturnError('El Almacén destino ya no es válido.');

    const existingBoxes = await ProductBox.findAll({
      where: { suppliedProductId: suppliedProduct.id },
      attributes: ['id', 'indexFromSupliedProduct'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const existingIndexes = new Set(
      existingBoxes.map((box) => box.indexFromSupliedProduct),
    );
    const newIndexes = [...new Set(reqBody.boxes)]
      .filter((index) => !existingIndexes.has(index))
      .sort((a, b) => a - b);
    if (!newIndexes.length)
      throw new StoreReturnError(
        'Todos los índices seleccionados ya fueron atendidos.',
      );
    if (
      newIndexes.some((index) => index < 1 || index > suppliedProduct.quantity)
    )
      throw new StoreReturnError(
        'Uno de los índices de caja está fuera del rango solicitado.',
      );

    const requiredUnits = newIndexes.length * suppliedProduct.boxSize;
    const lots = await ProductBox.findAll({
      where: {
        productId: suppliedProduct.productId,
        warehouseId: sourceWarehouse.id,
        inventoryKind: 'EXPLODED',
        lifecycleStatus: 'ACTIVE',
        stock: { [Op.gt]: 0 },
      },
      order: [
        ['createdAt', 'ASC'],
        ['id', 'ASC'],
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const availableUnits = lots.reduce((sum, lot) => sum + lot.stock, 0);
    if (availableUnits < requiredUnits)
      throw new StoreReturnError(
        `Stock unitario insuficiente. Requiere ${requiredUnits} y la tienda tiene ${availableUnits}.`,
      );

    const createdBoxes = [];
    let lotIndex = 0;
    for (const boxIndex of newIndexes) {
      const targetBox = await ProductBox.create(
        {
          indexFromSupliedProduct: boxIndex,
          boxSize: suppliedProduct.boxSize,
          stock: suppliedProduct.boxSize,
          isAvailable: true,
          inventoryKind: 'PHYSICAL',
          lifecycleStatus: 'ACTIVE',
          sourceType: supplyTypes.STORE_RETURN,
          productId: suppliedProduct.productId,
          warehouseId: destinationWarehouse.id,
          supplyId: supply.id,
          suppliedProductId: suppliedProduct.id,
        },
        { transaction },
      );
      await targetBox.registerLog(
        PRODUCTBOX_UPDATES.STORE_RETURN.value,
        reqUser,
        {
          transaction,
        },
      );

      let remaining = suppliedProduct.boxSize;
      let targetAfter = 0;
      while (remaining > 0) {
        const sourceLot = lots[lotIndex];
        if (!sourceLot)
          throw new StoreReturnError('El stock cambió durante la atención.');
        const quantity = Math.min(remaining, sourceLot.stock);
        const sourceBefore = sourceLot.stock;
        const sourceAfter = sourceBefore - quantity;
        await sourceLot.update(
          { stock: sourceAfter, isAvailable: sourceAfter > 0 },
          { transaction },
        );
        await sourceLot.registerLog(
          `Devuelto a almacén: ${quantity} unidades empacadas en ${targetBox.trackingCode}`,
          reqUser,
          { transaction },
        );
        await InventoryMovement.create(
          {
            type: 'STORE_RETURN_PACKING',
            quantity,
            productId: suppliedProduct.productId,
            sourceProductBoxId: sourceLot.id,
            targetProductBoxId: targetBox.id,
            fromWarehouseId: sourceWarehouse.id,
            toWarehouseId: destinationWarehouse.id,
            sourceStockBefore: sourceBefore,
            sourceStockAfter: sourceAfter,
            targetStockBefore: targetAfter,
            targetStockAfter: targetAfter + quantity,
            userId: reqUser.id,
            supplyId: supply.id,
            description: 'Unidades de tienda empacadas como caja física',
            metadata: { boxIndex, suppliedProductId: suppliedProduct.id },
          },
          { transaction },
        );
        remaining -= quantity;
        targetAfter += quantity;
        if (sourceAfter === 0) lotIndex += 1;
      }
      createdBoxes.push(targetBox);
    }

    const suppliedQuantity = existingBoxes.length + createdBoxes.length;
    await suppliedProduct.update(
      {
        suppliedQuantity,
        maxIndexSupplied: Math.max(...[...existingIndexes, ...newIndexes]),
        status:
          suppliedQuantity === suppliedProduct.quantity
            ? supplyStatus.ATTENDED
            : supplyStatus.PENDING,
      },
      { transaction },
    );
    await Product.updateStock(suppliedProduct.productId, { transaction });
    await transaction.commit();
    return setResponse(200, 'Store return boxes attended.', createdBoxes);
  } catch (error) {
    await transaction.rollback();
    return setResponse(
      error.status || 400,
      'Store return attend failed.',
      null,
      error.message,
    );
  }
};

const updateStoreReturnStatus = async (reqBody, reqParams, reqUser) => {
  const transaction = await sequelize.transaction();
  try {
    const supply = await Supply.findByPk(reqParams.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!supply || supply.type !== supplyTypes.STORE_RETURN)
      throw new StoreReturnError('Devolución de tienda no encontrada.', 404);
    if (supply.status !== supplyStatus.PENDING)
      throw new StoreReturnError('La devolución ya fue cerrada.');
    const suppliedProducts = await SuppliedProduct.findAll({
      where: { supplyId: supply.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const attended = suppliedProducts.reduce(
      (sum, item) => sum + item.suppliedQuantity,
      0,
    );
    const requested = suppliedProducts.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const pending = requested - attended;

    if (reqBody.status === supplyStatus.ATTENDED && pending !== 0)
      throw new StoreReturnError('Existen cajas pendientes de atender.');
    if (reqBody.status === supplyStatus.CANCELLED && attended !== 0)
      throw new StoreReturnError(
        'La devolución ya tiene cajas atendidas. Use Cancelar saldo pendiente.',
      );
    if (
      reqBody.status === supplyStatus.CLOSED_PARTIAL &&
      (attended === 0 || pending === 0)
    )
      throw new StoreReturnError(
        'El cierre parcial requiere cajas atendidas y cajas todavía pendientes.',
      );

    for (const item of suppliedProducts) {
      const cancelledQuantity = item.quantity - item.suppliedQuantity;
      let itemStatus = supplyStatus.ATTENDED;
      if (item.suppliedQuantity === 0) itemStatus = supplyStatus.CANCELLED;
      else if (cancelledQuantity > 0) itemStatus = supplyStatus.CLOSED_PARTIAL;
      await item.update(
        {
          cancelledQuantity:
            reqBody.status === supplyStatus.ATTENDED ? 0 : cancelledQuantity,
          status: itemStatus,
        },
        { transaction },
      );
    }

    await supply.update(
      {
        status: reqBody.status,
        attentionDate:
          reqBody.status === supplyStatus.ATTENDED ||
          reqBody.status === supplyStatus.CLOSED_PARTIAL
            ? new Date()
            : supply.attentionDate,
        cancellationDate:
          reqBody.status === supplyStatus.CANCELLED ? new Date() : null,
      },
      { transaction },
    );
    await SupplyLog.create(
      {
        log:
          reqBody.status === supplyStatus.CLOSED_PARTIAL
            ? 'Saldo pendiente de devolución cancelado'
            : 'Estado de devolución actualizado',
        action: 'STORE_RETURN_STATUS',
        detail: `${attended} cajas atendidas | ${pending} cajas canceladas`,
        userId: reqUser.id,
        supplyId: supply.id,
      },
      { transaction },
    );
    await transaction.commit();
    return setResponse(200, 'Store return status updated.', supply);
  } catch (error) {
    await transaction.rollback();
    return setResponse(
      error.status || 400,
      'Store return status update failed.',
      null,
      error.message,
    );
  }
};

module.exports = {
  StoreReturnError,
  attendStoreReturn,
  getStoreReturnAvailability,
  requestedUnitsByProduct,
  updateStoreReturnStatus,
  validateStoreReturnRequest,
};
