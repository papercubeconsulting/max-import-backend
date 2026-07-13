const {
  Product,
  ProductBarcode,
  ProductBox,
  Provider,
  UnitTicketPrint,
  Warehouse,
} = require('@dbModels');
const { setResponse } = require('@/utils');
const { ensureProductBarcode } = require('../productBarcode/productBarcode.service');

const create = async (reqBody, reqUser) => {
  const product = await Product.findByPk(reqBody.productId, { include: [Provider] });
  if (!product) return setResponse(404, 'Product not found.', null, 'Producto no encontrado.');

  let productBox = null;
  if (reqBody.productBoxId) {
    productBox = await ProductBox.findByPk(reqBody.productBoxId);
    if (!productBox || productBox.productId !== product.id)
      return setResponse(400, 'Invalid origin product box.', null, 'La caja origen no pertenece al producto.');
  }

  if (reqBody.warehouseId) {
    const warehouse = await Warehouse.findByPk(reqBody.warehouseId);
    if (!warehouse)
      return setResponse(404, 'Warehouse not found.', null, 'Ubicación no encontrada.');
  }

  if (reqBody.reprintOfId) {
    const original = await UnitTicketPrint.findByPk(reqBody.reprintOfId);
    if (!original || original.productId !== product.id)
      return setResponse(400, 'Invalid reprint reference.', null, 'La impresión original no es válida.');
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

const read = async reqParams => {
  const print = await UnitTicketPrint.findByPk(reqParams.id, {
    include: [
      { model: Product, include: [Provider, ProductBarcode] },
      ProductBox,
      Warehouse,
    ],
  });
  if (!print)
    return setResponse(404, 'Unit ticket print not found.', null, 'Impresión no encontrada.');
  return setResponse(200, 'Unit ticket print found.', print);
};

const list = async reqQuery => {
  const prints = await UnitTicketPrint.findAll({
    where: reqQuery,
    include: [Product, ProductBox, Warehouse],
    order: [['createdAt', 'DESC']],
  });
  return setResponse(200, 'Unit ticket prints found.', prints);
};

module.exports = { create, read, list };
