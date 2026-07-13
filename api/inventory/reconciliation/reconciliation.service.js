const { Op } = require('sequelize');
const {
  InventoryMovement,
  InventoryReconciliation,
  Product,
  ProductBox,
  SuppliedProduct,
  Supply,
  SupplyLog,
  Warehouse,
} = require('@dbModels');
const { sequelize } = require('@root/startup/db');
const {
  setResponse,
  supplyStatus,
  warehouseTypes,
} = require('@/utils');

const activeWarehouseTypes = [warehouseTypes.WAREHOUSE, warehouseTypes.STORE];

const loadSnapshot = async (productId, options = {}) => {
  const boxes = await ProductBox.findAll({
    where: { productId, stock: { [Op.gt]: 0 } },
    include: [
      {
        model: Warehouse,
        attributes: ['id', 'name', 'type'],
        required: true,
      },
    ],
    order: [['createdAt', 'ASC'], ['id', 'ASC']],
    transaction: options.transaction,
    lock: options.lock,
  });
  const activeBoxes = boxes.filter(box => activeWarehouseTypes.includes(box.warehouse.type));
  return {
    systemStock: activeBoxes.reduce((sum, box) => sum + box.stock, 0),
    totalStock: boxes.reduce((sum, box) => sum + box.stock, 0),
    boxes,
    activeBoxes,
  };
};

const serializeSource = box => ({
  productBoxId: box.id,
  trackingCode: box.trackingCode,
  inventoryKind: box.inventoryKind,
  lifecycleStatus: box.lifecycleStatus,
  stock: box.stock,
  warehouseId: box.warehouseId,
  warehouseName: box.warehouse.name,
  warehouseType: box.warehouse.type,
  originProductBoxId: box.originProductBoxId,
});

const preview = async reqQuery => {
  const product = await Product.findByPk(reqQuery.productId);
  if (!product) return setResponse(404, 'Product not found.', null, 'Producto no encontrado.');

  const warehouse = await Warehouse.findByPk(reqQuery.warehouseId);
  if (!warehouse || warehouse.type !== warehouseTypes.STORE)
    return setResponse(400, 'Invalid store.', null, 'Debe seleccionar una tienda válida.');

  const snapshot = await loadSnapshot(product.id);
  const countedStock = Number(reqQuery.countedStock);
  const delta = countedStock - snapshot.systemStock;

  return setResponse(200, 'Inventory reconciliation preview.', {
    product,
    warehouse,
    totalStock: snapshot.totalStock,
    systemStock: snapshot.systemStock,
    countedStock,
    delta,
    sources: delta < 0 ? snapshot.activeBoxes.map(serializeSource) : [],
  });
};

const getAdjustmentWarehouse = async transaction => {
  let warehouse = await Warehouse.findOne({
    where: { type: warehouseTypes.ADJUSTMENT },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!warehouse) {
    warehouse = await Warehouse.create(
      { name: 'Ajuste Inventario', address: '-', type: warehouseTypes.ADJUSTMENT },
      { transaction },
    );
  }
  return warehouse;
};

const createIncrease = async ({ product, warehouse, delta, reconciliation, user }, transaction) => {
  const supply = await Supply.create(
    {
      providerId: product.providerId,
      warehouseId: warehouse.id,
      code: `AJUSTE-${reconciliation.id}`,
      observations: 'Ajuste Inventario',
      status: supplyStatus.ATTENDED,
      attentionDate: new Date(),
      type: 'INVENTORY_ADJUSTMENT',
    },
    { transaction },
  );
  const suppliedProduct = await SuppliedProduct.create(
    {
      quantity: 1,
      initQuantity: 1,
      suppliedQuantity: 1,
      maxIndexSupplied: 1,
      boxSize: delta,
      initBoxSize: delta,
      status: supplyStatus.ATTENDED,
      supplyId: supply.id,
      productId: product.id,
    },
    { transaction },
  );
  const lot = await ProductBox.create(
    {
      trackingCode: null,
      boxSize: delta,
      stock: delta,
      isAvailable: true,
      inventoryKind: 'EXPLODED',
      lifecycleStatus: 'ACTIVE',
      originProductBoxId: null,
      explodedAt: new Date(),
      explodedBy: user.id,
      sourceType: 'RECONCILIATION',
      productId: product.id,
      warehouseId: warehouse.id,
      supplyId: supply.id,
      suppliedProductId: suppliedProduct.id,
    },
    { transaction },
  );
  await reconciliation.update({ supplyId: supply.id }, { transaction });
  await InventoryMovement.create(
    {
      type: 'RECONCILIATION_IN',
      quantity: delta,
      productId: product.id,
      targetProductBoxId: lot.id,
      toWarehouseId: warehouse.id,
      targetStockBefore: 0,
      targetStockAfter: delta,
      userId: user.id,
      supplyId: supply.id,
      reconciliationId: reconciliation.id,
      description: 'Aumento por Ajuste Inventario',
    },
    { transaction },
  );
  if (SupplyLog)
    await SupplyLog.create(
      {
        log: 'Abastecimiento creado por reconciliación',
        action: 'INVENTORY_ADJUSTMENT',
        detail: `+${delta} unidades`,
        userId: user.id,
        supplyId: supply.id,
      },
      { transaction },
    );
  return { supply, lot };
};

const createDecrease = async (
  { product, sources, expectedQuantity, reconciliation, user },
  transaction,
) => {
  if (!sources || !sources.length)
    throw new Error('Debe seleccionar las fuentes del ajuste.');
  const uniqueIds = new Set(sources.map(source => source.productBoxId));
  if (uniqueIds.size !== sources.length)
    throw new Error('No puede seleccionar una fuente más de una vez.');
  const selectedTotal = sources.reduce((sum, source) => sum + source.quantity, 0);
  if (selectedTotal !== expectedQuantity)
    throw new Error('Las cantidades seleccionadas deben coincidir exactamente con el faltante.');

  const boxes = await ProductBox.findAll({
    where: { id: [...uniqueIds], productId: product.id },
    include: [{ model: Warehouse, required: true }],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (boxes.length !== uniqueIds.size) throw new Error('Una de las fuentes ya no existe.');

  const adjustmentWarehouse = await getAdjustmentWarehouse(transaction);
  await reconciliation.update(
    { adjustmentWarehouseId: adjustmentWarehouse.id },
    { transaction },
  );
  const adjustmentLot = await ProductBox.create(
    {
      trackingCode: null,
      boxSize: expectedQuantity,
      stock: expectedQuantity,
      isAvailable: false,
      inventoryKind: 'EXPLODED',
      lifecycleStatus: 'ACTIVE',
      explodedAt: new Date(),
      explodedBy: user.id,
      sourceType: 'RECONCILIATION_ADJUSTMENT',
      productId: product.id,
      warehouseId: adjustmentWarehouse.id,
    },
    { transaction },
  );

  let targetBefore = 0;
  for (const selected of sources) {
    const source = boxes.find(box => box.id === selected.productBoxId);
    if (!source || !activeWarehouseTypes.includes(source.warehouse.type))
      throw new Error('Una fuente seleccionada no pertenece al inventario activo.');
    if (source.inventoryKind === 'PHYSICAL' && source.lifecycleStatus !== 'ACTIVE')
      throw new Error('Una caja seleccionada ya fue explotada.');
    if (selected.quantity <= 0 || selected.quantity > source.stock)
      throw new Error('Una cantidad seleccionada excede el stock disponible.');

    const sourceBefore = source.stock;
    const sourceAfter = sourceBefore - selected.quantity;
    await source.update(
      { stock: sourceAfter, isAvailable: sourceAfter > 0 },
      { transaction },
    );
    await source.registerLog(
      `Ajuste Inventario: ${selected.quantity} unidades no disponibles`,
      user,
      { transaction },
    );
    await InventoryMovement.create(
      {
        type: 'RECONCILIATION_TO_ADJUSTMENT',
        quantity: selected.quantity,
        productId: product.id,
        sourceProductBoxId: source.id,
        targetProductBoxId: adjustmentLot.id,
        fromWarehouseId: source.warehouseId,
        toWarehouseId: adjustmentWarehouse.id,
        sourceStockBefore: sourceBefore,
        sourceStockAfter: sourceAfter,
        targetStockBefore: targetBefore,
        targetStockAfter: targetBefore + selected.quantity,
        userId: user.id,
        reconciliationId: reconciliation.id,
        description: 'Stock reclasificado como no disponible',
      },
      { transaction },
    );
    targetBefore += selected.quantity;
  }
  return { adjustmentWarehouse, adjustmentLot };
};

const confirm = async (reqBody, reqUser) => {
  const transaction = await sequelize.transaction();
  try {
    const product = await Product.findByPk(reqBody.productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!product) throw new Error('Producto no encontrado.');
    const warehouse = await Warehouse.findByPk(reqBody.warehouseId, {
      transaction,
      lock: transaction.LOCK.SHARE,
    });
    if (!warehouse || warehouse.type !== warehouseTypes.STORE)
      throw new Error('Debe seleccionar una tienda válida.');

    const snapshot = await loadSnapshot(product.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (snapshot.systemStock !== reqBody.systemStock)
      throw new Error('El inventario cambió desde la vista previa. Vuelva a calcular el ajuste.');

    const delta = reqBody.countedStock - snapshot.systemStock;
    const reconciliation = await InventoryReconciliation.create(
      {
        productId: product.id,
        warehouseId: warehouse.id,
        systemStock: snapshot.systemStock,
        countedStock: reqBody.countedStock,
        delta,
        status: 'COMPLETED',
        createdBy: reqUser.id,
        confirmedBy: reqUser.id,
      },
      { transaction },
    );

    let operation = null;
    if (delta > 0)
      operation = await createIncrease(
        { product, warehouse, delta, reconciliation, user: reqUser },
        transaction,
      );
    if (delta < 0)
      operation = await createDecrease(
        {
          product,
          sources: reqBody.sources,
          expectedQuantity: Math.abs(delta),
          reconciliation,
          user: reqUser,
        },
        transaction,
      );

    await Product.updateStock(product.id, { transaction });
    await transaction.commit();
    return setResponse(201, 'Inventory reconciled.', { reconciliation, operation });
  } catch (error) {
    await transaction.rollback();
    return setResponse(400, 'Inventory reconciliation failed.', null, error.message);
  }
};

const list = async reqQuery => {
  const reconciliations = await InventoryReconciliation.findAll({
    where: reqQuery,
    include: [
      Product,
      Warehouse,
      { model: Warehouse, as: 'adjustmentWarehouse' },
      InventoryMovement,
    ],
    order: [['createdAt', 'DESC']],
  });
  return setResponse(200, 'Inventory reconciliations found.', reconciliations);
};

const read = async reqParams => {
  const reconciliation = await InventoryReconciliation.findByPk(reqParams.id, {
    include: [
      Product,
      Warehouse,
      { model: Warehouse, as: 'adjustmentWarehouse' },
      InventoryMovement,
    ],
  });
  if (!reconciliation)
    return setResponse(404, 'Inventory reconciliation not found.', null, 'Reconciliación no encontrada.');
  return setResponse(200, 'Inventory reconciliation found.', reconciliation);
};

module.exports = { confirm, list, preview, read };
