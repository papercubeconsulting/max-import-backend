const { Op } = require('sequelize');
const {
  InventoryMovement,
  InventoryReconciliation,
  Product,
  ProductBox,
  SuppliedProduct,
  Supply,
  SupplyLog,
  User,
  Warehouse,
} = require('@dbModels');
const { sequelize } = require('@root/startup/db');
const {
  calculateBoxReduction,
  sumBoxReductions,
} = require('./reconciliation.utils');
const {
  setResponse,
  reconciliationModes,
  supplyStatus,
  warehouseTypes,
} = require('@/utils');

const activeWarehouseTypes = [warehouseTypes.WAREHOUSE, warehouseTypes.STORE];
const reconciliationStatus = {
  PENDING: 'PENDING',
  DENIED: 'DENIED',
  COMPLETED: 'COMPLETED',
};

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

const listEligibleBoxes = async reqQuery => {
  const product = await Product.findByPk(reqQuery.productId, {
    attributes: ['id', 'code'],
  });
  if (!product)
    return setResponse(404, 'Product not found.', null, 'Producto no encontrado.');

  const page = Number(reqQuery.page || 1);
  const pageSize = Number(reqQuery.pageSize || 20);
  const where = {
    productId: product.id,
    inventoryKind: 'PHYSICAL',
    lifecycleStatus: 'ACTIVE',
    stock: { [Op.gt]: 0 },
  };
  const search = String(reqQuery.search || '').trim();
  if (search) where.trackingCode = { [Op.iLike]: `%${search}%` };

  const result = await ProductBox.findAndCountAll({
    where,
    attributes: [
      'id',
      'trackingCode',
      'boxSize',
      'stock',
      'warehouseId',
      'inventoryKind',
      'lifecycleStatus',
    ],
    include: [
      {
        model: Warehouse,
        attributes: ['id', 'name', 'type'],
        where: { type: warehouseTypes.WAREHOUSE },
        required: true,
      },
    ],
    order: [['createdAt', 'ASC'], ['id', 'ASC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    distinct: true,
  });

  const snapshot = await loadSnapshot(product.id);
  return setResponse(200, 'Eligible reconciliation boxes found.', {
    product,
    rows: result.rows.map(box => ({
      productBoxId: box.id,
      trackingCode: box.trackingCode,
      boxSize: box.boxSize,
      stock: box.stock,
      warehouseId: box.warehouseId,
      warehouseName: box.warehouse.name,
    })),
    count: result.count,
    page,
    pageSize,
    systemStock: snapshot.systemStock,
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

const validateDecreaseSources = async (
  { product, sources, expectedQuantity },
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

  return sources.map(selected => {
    const source = boxes.find(box => box.id === selected.productBoxId);
    if (!source || !activeWarehouseTypes.includes(source.warehouse.type))
      throw new Error('Una fuente seleccionada no pertenece al inventario activo.');
    if (source.inventoryKind === 'PHYSICAL' && source.lifecycleStatus !== 'ACTIVE')
      throw new Error('Una caja seleccionada ya fue explotada.');
    if (selected.quantity <= 0 || selected.quantity > source.stock)
      throw new Error('Una cantidad seleccionada excede el stock disponible.');

    return {
      productBoxId: selected.productBoxId,
      quantity: selected.quantity,
      trackingCode: source.trackingCode,
      inventoryKind: source.inventoryKind,
      lifecycleStatus: source.lifecycleStatus,
      stockAtRequest: source.stock,
      warehouseId: source.warehouseId,
      warehouseName: source.warehouse.name,
      warehouseType: source.warehouse.type,
    };
  });
};

const createDecrease = async (
  { product, sources, expectedQuantity, reconciliation, user },
  transaction,
) => {
  await validateDecreaseSources({ product, sources, expectedQuantity }, transaction);
  const uniqueIds = new Set(sources.map(source => source.productBoxId));
  const boxes = await ProductBox.findAll({
    where: { id: [...uniqueIds], productId: product.id },
    include: [{ model: Warehouse, required: true }],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

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

const confirmBoxStock = async ({ body, product, user }, transaction) => {
  const changes = body.boxes || [];
  const ids = changes.map(item => item.productBoxId);
  const boxes = await ProductBox.findAll({
    where: {
      id: ids,
      productId: product.id,
      inventoryKind: 'PHYSICAL',
      lifecycleStatus: 'ACTIVE',
      stock: { [Op.gt]: 0 },
    },
    include: [
      {
        model: Warehouse,
        where: { type: warehouseTypes.WAREHOUSE },
        required: true,
      },
    ],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (boxes.length !== ids.length)
    throw new Error(
      'Una o más cajas ya no están disponibles en un almacén válido.',
    );

  const sources = changes.map(change => {
    const box = boxes.find(item => item.id === change.productBoxId);
    const targetStock = Number(change.targetStock);
    if (!box) throw new Error('Una de las cajas seleccionadas no existe.');
    let quantity;
    try {
      quantity = calculateBoxReduction(box.stock, targetStock);
    } catch (error) {
      throw new Error(
        `La caja ${box.trackingCode} debe quedar con una cantidad entre 0 y ${box.stock - 1}.`,
      );
    }
    return {
      productBoxId: box.id,
      quantity,
      targetStock,
      trackingCode: box.trackingCode,
      inventoryKind: box.inventoryKind,
      lifecycleStatus: box.lifecycleStatus,
      stockAtRequest: box.stock,
      warehouseId: box.warehouseId,
      warehouseName: box.warehouse.name,
      warehouseType: box.warehouse.type,
    };
  });
  const reduction = sumBoxReductions(sources);
  if (reduction <= 0)
    throw new Error('Debe reducir al menos una unidad de las cajas seleccionadas.');

  const snapshot = await loadSnapshot(product.id, { transaction });
  const reconciliation = await InventoryReconciliation.create(
    {
      mode: reconciliationModes.BOX_STOCK,
      productId: product.id,
      warehouseId: null,
      systemStock: snapshot.systemStock,
      countedStock: snapshot.systemStock - reduction,
      delta: -reduction,
      status: reconciliationStatus.PENDING,
      sources,
      createdBy: user.id,
    },
    { transaction },
  );
  return reconciliation;
};

const validateBoxStockApproval = async (
  { reconciliation, product },
  transaction,
) => {
  const sources = reconciliation.sources || [];
  if (!sources.length)
    throw new Error('La reconciliación no contiene cajas para ajustar.');
  const ids = sources.map(source => source.productBoxId);
  const boxes = await ProductBox.findAll({
    where: { id: ids },
    include: [{ model: Warehouse, required: true }],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (boxes.length !== ids.length)
    throw new Error('Una de las cajas seleccionadas ya no existe.');

  for (const selected of sources) {
    const box = boxes.find(item => item.id === selected.productBoxId);
    if (box.productId !== product.id)
      throw new Error(`La caja ${selected.trackingCode} cambió de producto.`);
    if (
      box.inventoryKind !== 'PHYSICAL' ||
      box.lifecycleStatus !== 'ACTIVE' ||
      box.warehouse.type !== warehouseTypes.WAREHOUSE
    )
      throw new Error(
        `La caja ${selected.trackingCode} ya no es una caja física activa en almacén.`,
      );
    if (box.warehouseId !== selected.warehouseId)
      throw new Error(`La caja ${selected.trackingCode} cambió de almacén.`);
    if (box.stock !== selected.stockAtRequest)
      throw new Error(
        `La caja ${selected.trackingCode} cambió de ${selected.stockAtRequest} a ${box.stock} unidades. Deniegue y cree una nueva solicitud.`,
      );
    let quantity;
    try {
      quantity = calculateBoxReduction(
        selected.stockAtRequest,
        selected.targetStock,
      );
    } catch (error) {
      throw new Error(`El ajuste solicitado para ${selected.trackingCode} no es válido.`);
    }
    if (selected.quantity !== quantity)
      throw new Error(`El ajuste solicitado para ${selected.trackingCode} no es válido.`);
  }

  const expectedQuantity = sumBoxReductions(sources);
  if (reconciliation.delta !== -expectedQuantity)
    throw new Error('La diferencia de la reconciliación no coincide con sus cajas.');
  return expectedQuantity;
};

const confirm = async (reqBody, reqUser) => {
  const transaction = await sequelize.transaction();
  try {
    const product = await Product.findByPk(reqBody.productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!product) throw new Error('Producto no encontrado.');
    if (reqBody.mode === reconciliationModes.BOX_STOCK) {
      const reconciliation = await confirmBoxStock(
        { body: reqBody, product, user: reqUser },
        transaction,
      );
      await transaction.commit();
      return setResponse(201, 'Box stock reconciliation requested.', {
        reconciliation,
      });
    }
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
    let sources = [];
    if (delta < 0) {
      sources = await validateDecreaseSources(
        {
          product,
          sources: reqBody.sources,
          expectedQuantity: Math.abs(delta),
        },
        transaction,
      );
    }

    const reconciliation = await InventoryReconciliation.create(
      {
        mode: reconciliationModes.GLOBAL_COUNT,
        productId: product.id,
        warehouseId: warehouse.id,
        systemStock: snapshot.systemStock,
        countedStock: reqBody.countedStock,
        delta,
        status: reconciliationStatus.PENDING,
        sources,
        createdBy: reqUser.id,
      },
      { transaction },
    );

    await transaction.commit();
    return setResponse(201, 'Inventory reconciliation requested.', { reconciliation });
  } catch (error) {
    await transaction.rollback();
    return setResponse(400, 'Inventory reconciliation request failed.', null, error.message);
  }
};

const approveOne = async (id, reqUser) => {
  const transaction = await sequelize.transaction();
  try {
    const reconciliation = await InventoryReconciliation.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!reconciliation)
      throw new Error('Reconciliación no encontrada.');
    if (reconciliation.status !== reconciliationStatus.PENDING)
      throw new Error('Solo se pueden aprobar reconciliaciones pendientes.');

    const product = await Product.findByPk(reconciliation.productId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!product) throw new Error('Producto no encontrado.');

    if (reconciliation.mode === reconciliationModes.BOX_STOCK) {
      const expectedQuantity = await validateBoxStockApproval(
        { reconciliation, product },
        transaction,
      );
      const operation = await createDecrease(
        {
          product,
          sources: reconciliation.sources || [],
          expectedQuantity,
          reconciliation,
          user: reqUser,
        },
        transaction,
      );
      await reconciliation.update(
        {
          status: reconciliationStatus.COMPLETED,
          confirmedBy: reqUser.id,
        },
        { transaction },
      );
      await Product.updateStock(product.id, { transaction });
      await transaction.commit();
      return { id: reconciliation.id, ok: true, reconciliation, operation };
    }

    const warehouse = await Warehouse.findByPk(reconciliation.warehouseId, {
      transaction,
      lock: transaction.LOCK.SHARE,
    });
    if (!warehouse || warehouse.type !== warehouseTypes.STORE)
      throw new Error('La tienda de la reconciliación ya no es válida.');

    const snapshot = await loadSnapshot(product.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (snapshot.systemStock !== reconciliation.systemStock)
      throw new Error('El inventario cambió desde la solicitud. Deniegue y solicite un nuevo cálculo.');

    const delta = reconciliation.countedStock - snapshot.systemStock;
    if (delta !== reconciliation.delta)
      throw new Error('La diferencia de la solicitud ya no coincide con el inventario actual.');

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
          sources: reconciliation.sources || [],
          expectedQuantity: Math.abs(delta),
          reconciliation,
          user: reqUser,
        },
        transaction,
      );

    await reconciliation.update(
      {
        status: reconciliationStatus.COMPLETED,
        confirmedBy: reqUser.id,
      },
      { transaction },
    );
    await Product.updateStock(product.id, { transaction });
    await transaction.commit();
    return { id: reconciliation.id, ok: true, reconciliation, operation };
  } catch (error) {
    await transaction.rollback();
    return { id, ok: false, error: error.message };
  }
};

const approve = async (reqBody, reqUser) => {
  const ids = reqBody.ids || [];
  const results = [];
  for (const id of ids) results.push(await approveOne(id, reqUser));
  const failed = results.filter(result => !result.ok);
  if (failed.length === results.length)
    return setResponse(400, 'Inventory reconciliations approve failed.', { results }, failed[0]?.error);
  return setResponse(200, 'Inventory reconciliations approved.', { results });
};

const denyOne = async (id, reqUser) => {
  const transaction = await sequelize.transaction();
  try {
    const reconciliation = await InventoryReconciliation.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!reconciliation)
      throw new Error('Reconciliación no encontrada.');
    if (reconciliation.status !== reconciliationStatus.PENDING)
      throw new Error('Solo se pueden denegar reconciliaciones pendientes.');
    await reconciliation.update(
      {
        status: reconciliationStatus.DENIED,
        confirmedBy: reqUser.id,
      },
      { transaction },
    );
    await transaction.commit();
    return { id: reconciliation.id, ok: true, reconciliation };
  } catch (error) {
    await transaction.rollback();
    return { id, ok: false, error: error.message };
  }
};

const deny = async (reqBody, reqUser) => {
  const ids = reqBody.ids || [];
  const results = [];
  for (const id of ids) results.push(await denyOne(id, reqUser));
  const failed = results.filter(result => !result.ok);
  if (failed.length === results.length)
    return setResponse(400, 'Inventory reconciliations deny failed.', { results }, failed[0]?.error);
  return setResponse(200, 'Inventory reconciliations denied.', { results });
};

const list = async reqQuery => {
  const where = {};
  if (reqQuery.productId) where.productId = reqQuery.productId;
  if (reqQuery.status) where.status = reqQuery.status;
  if (reqQuery.mode) where.mode = reqQuery.mode;

  const reconciliations = await InventoryReconciliation.findAll({
    where,
    include: [
      Product,
      Warehouse,
      { model: Warehouse, as: 'adjustmentWarehouse' },
      { model: User, as: 'creator', attributes: ['id', 'name', 'lastname', 'email'] },
      { model: User, as: 'confirmer', attributes: ['id', 'name', 'lastname', 'email'] },
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
      { model: User, as: 'creator', attributes: ['id', 'name', 'lastname', 'email'] },
      { model: User, as: 'confirmer', attributes: ['id', 'name', 'lastname', 'email'] },
      InventoryMovement,
    ],
  });
  if (!reconciliation)
    return setResponse(404, 'Inventory reconciliation not found.', null, 'Reconciliación no encontrada.');
  return setResponse(200, 'Inventory reconciliation found.', reconciliation);
};

module.exports = {
  approve,
  confirm,
  deny,
  list,
  listEligibleBoxes,
  preview,
  read,
};
