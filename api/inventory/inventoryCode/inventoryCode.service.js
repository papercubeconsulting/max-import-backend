const { Op } = require('sequelize');
const {
  InventoryMovement,
  Product,
  ProductBarcode,
  ProductBox,
  ProductBoxLog,
  Provider,
  UnitTicketPrint,
  User,
  Warehouse,
} = require('@dbModels');
const { setResponse, warehouseTypes } = require('@/utils');
const { ensureProductBarcode } = require('../productBarcode/productBarcode.service');

const resolveBox = async code => {
  const productBox = await ProductBox.findOne({
    where: { trackingCode: code },
    include: [
      { model: Product, include: [Provider] },
      Warehouse,
      { model: User, as: 'explodedByUser', attributes: ['id', 'name', 'lastname'] },
      {
        model: ProductBox,
        as: 'explodedLots',
        include: [
          Warehouse,
          { model: User, as: 'explodedByUser', attributes: ['id', 'name', 'lastname'] },
        ],
      },
      { model: ProductBox, as: 'originProductBox' },
      {
        model: ProductBoxLog,
        include: [
          { model: Warehouse, attributes: ['id', 'name', 'type'] },
          { model: User, attributes: ['id', 'name', 'lastname'] },
        ],
      },
    ],
    order: [[{ model: ProductBoxLog }, 'createdAt', 'DESC']],
  });
  if (!productBox)
    return setResponse(404, 'Inventory code not found.', null, 'Código de inventario no encontrado.');
  const barcode = await ensureProductBarcode(productBox.product);
  const movements = await InventoryMovement.findAll({
    where: {
      [Op.or]: [
        { sourceProductBoxId: productBox.id },
        { targetProductBoxId: productBox.id },
      ],
    },
    order: [['createdAt', 'DESC']],
  });
  return setResponse(200, 'Inventory code found.', {
    type: 'BOX',
    code,
    productBox,
    product: productBox.product,
    productBarcode: barcode,
    inventoryMovements: movements,
  });
};

const resolveProduct = async code => {
  const barcode = await ProductBarcode.findOne({
    where: { barcode: code, type: 'UNIT_PRODUCT', isActive: true },
    include: [{ model: Product, include: [Provider] }],
  });
  if (!barcode)
    return setResponse(404, 'Inventory code not found.', null, 'Código de inventario no encontrado.');
  const lots = await ProductBox.findAll({
    where: { productId: barcode.productId, inventoryKind: 'EXPLODED', stock: { [Op.gt]: 0 } },
    include: [
      { model: Warehouse, where: { type: warehouseTypes.STORE } },
      { model: ProductBox, as: 'originProductBox' },
    ],
    order: [['createdAt', 'ASC'], ['id', 'ASC']],
  });
  const stockByStore = Object.values(lots.reduce((acc, lot) => {
    if (!acc[lot.warehouseId])
      acc[lot.warehouseId] = {
        warehouseId: lot.warehouseId,
        warehouseName: lot.warehouse.name,
        stock: 0,
      };
    acc[lot.warehouseId].stock += lot.stock;
    return acc;
  }, {}));
  const [movements, prints] = await Promise.all([
    InventoryMovement.findAll({ where: { productId: barcode.productId }, order: [['createdAt', 'DESC']], limit: 200 }),
    UnitTicketPrint.findAll({ where: { productId: barcode.productId }, order: [['createdAt', 'DESC']], limit: 100 }),
  ]);
  return setResponse(200, 'Inventory code found.', {
    type: 'PRODUCT',
    code,
    productBarcode: barcode,
    product: barcode.product,
    unitLots: lots,
    stockByStore,
    inventoryMovements: movements,
    ticketPrints: prints,
  });
};

const resolve = async reqParams => {
  const code = String(reqParams.code || '').trim();
  if (code.startsWith('1')) return resolveBox(code);
  if (code.startsWith('2')) return resolveProduct(code);
  return setResponse(400, 'Invalid inventory code.', null, 'El código debe iniciar con 1 o 2.');
};

module.exports = { resolve };
