const {
  InventoryMovement,
  Product,
  ProductBox,
  Warehouse,
} = require('@dbModels');
const { sequelize } = require('@root/startup/db');
const {
  PRODUCTBOX_UPDATES,
  warehouseTypes,
} = require('@/utils/constants');

class InventoryOperationError extends Error {
  constructor(userMessage, status = 400) {
    super(userMessage);
    this.userMessage = userMessage;
    this.status = status;
  }
}

const registerMovement = (values, transaction) =>
  InventoryMovement.create(values, { transaction });

const moveLockedProductBox = async ({ productBoxId, warehouseId }, user, transaction) => {
  const productBox = await ProductBox.findByPk(productBoxId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!productBox) throw new InventoryOperationError('Caja no encontrada.', 404);
  if (productBox.inventoryKind !== 'PHYSICAL' || productBox.lifecycleStatus !== 'ACTIVE')
    throw new InventoryOperationError('La caja ya fue explotada y no puede volver a moverse.');

  const destination = await Warehouse.findByPk(warehouseId, {
    transaction,
    lock: transaction.LOCK.SHARE,
  });
  if (!destination) throw new InventoryOperationError('Ubicación destino no encontrada.', 404);
  if (destination.type === warehouseTypes.ADJUSTMENT)
    throw new InventoryOperationError('AjusteInventario solo puede recibir unidades mediante reconciliación.');
  if (
    productBox.warehouseId === warehouseId &&
    destination.type !== warehouseTypes.STORE
  )
    throw new InventoryOperationError('Debe seleccionar una ubicación distinta.');

  const previousWarehouseId = productBox.warehouseId;
  const quantity = productBox.stock;

  if (destination.type !== warehouseTypes.STORE) {
    await productBox.update(
      { warehouseId, previousWarehouseId },
      { transaction },
    );
    await productBox.registerLog(PRODUCTBOX_UPDATES.MOVEMENT.value, user, { transaction });
    await registerMovement(
      {
        type: 'BOX_MOVE',
        quantity,
        productId: productBox.productId,
        sourceProductBoxId: productBox.id,
        fromWarehouseId: previousWarehouseId,
        toWarehouseId: warehouseId,
        sourceStockBefore: quantity,
        sourceStockAfter: quantity,
        userId: user.id,
        description: 'Movimiento de caja física',
      },
      transaction,
    );
    return { productBox, explodedLot: null, wasExploded: false };
  }

  if (quantity <= 0)
    throw new InventoryOperationError('La caja no tiene unidades disponibles para explotar.');

  const explodedLot = await ProductBox.create(
    {
      trackingCode: null,
      boxSize: quantity,
      stock: quantity,
      isAvailable: true,
      inventoryKind: 'EXPLODED',
      lifecycleStatus: 'ACTIVE',
      originProductBoxId: productBox.id,
      explodedAt: new Date(),
      explodedBy: user.id,
      sourceType: 'BOX_EXPLOSION',
      productId: productBox.productId,
      warehouseId,
      supplyId: productBox.supplyId,
    },
    { transaction },
  );

  await productBox.update(
    {
      warehouseId,
      previousWarehouseId,
      stock: 0,
      isAvailable: false,
      lifecycleStatus: 'DISCARDED',
      explodedAt: new Date(),
      explodedBy: user.id,
    },
    { transaction },
  );
  await productBox.registerLog(`Caja explotada (${quantity} unidades)`, user, { transaction });
  await registerMovement(
    {
      type: 'BOX_EXPLOSION',
      quantity,
      productId: productBox.productId,
      sourceProductBoxId: productBox.id,
      targetProductBoxId: explodedLot.id,
      fromWarehouseId: previousWarehouseId,
      toWarehouseId: warehouseId,
      sourceStockBefore: quantity,
      sourceStockAfter: 0,
      targetStockBefore: 0,
      targetStockAfter: quantity,
      userId: user.id,
      supplyId: productBox.supplyId,
      description: 'Caja recibida en tienda y convertida a unidades',
    },
    transaction,
  );
  return { productBox, explodedLot, wasExploded: true };
};

const moveProductBoxes = async (boxes, user) => {
  const transaction = await sequelize.transaction();
  try {
    const results = [];
    for (const box of boxes) {
      results.push(
        await moveLockedProductBox(
          { productBoxId: box.id, warehouseId: box.warehouseId },
          user,
          transaction,
        ),
      );
    }
    const productIds = [...new Set(results.map(result => result.productBox.productId))];
    for (const productId of productIds)
      await Product.updateStock(productId, { transaction });
    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  InventoryOperationError,
  moveLockedProductBox,
  moveProductBoxes,
  registerMovement,
};
