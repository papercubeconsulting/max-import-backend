/* eslint-disable import/no-dynamic-require */
const winston = require('winston');
const {
  InventoryMovement,
  Supply,
  SuppliedProduct,
  ProductBox,
  Product,
  Warehouse,
} = require('@dbModels');

const { sequelize } = require(`@root/startup/db`);

const {
  supplyStatus: status,
  PRODUCTBOX_UPDATES,
  warehouseTypes,
} = require('../../../utils/constants');
const { setResponse } = require('../../../utils');
const { moveLockedProductBox } = require('../../inventoryTransaction.service');

const validateAttendSuppliedProduct = async (reqBody, reqParams) => {
  const suppliedProduct = await SuppliedProduct.findByPk(
    reqParams.idSuppliedProduct,
    {
      include: [Supply],
    },
  );

  // * El id del supplied product debe pertenecer al id del supply
  if (!suppliedProduct || suppliedProduct.supplyId !== reqParams.id)
    return setResponse(404, 'Supplied Product or Supply did not found.');

  // * El estado del supply es pendiente
  if (suppliedProduct.supply.status !== status.PENDING)
    return setResponse(400, 'Supply already cancelled or completed.');

  // *Los indices deben ser menores o iguales a la cantidad de cajas
  if (Math.max(...reqBody.boxes) > suppliedProduct.quantity)
    return setResponse(400, 'Box index out of limit.');

  return setResponse(200, 'Supplied Product attended.');
};

const updateAttendSuppliedProduct = async (reqBody, reqParams, reqUser) => {
  const t = await sequelize.transaction();
  try {
    const suppliedProduct = await SuppliedProduct.findByPk(
      reqParams.idSuppliedProduct,
      {
        include: [Supply],
        transaction: t,
      },
    );

    const existingProductBoxes = await ProductBox.findAll({
      where: { suppliedProductId: reqParams.idSuppliedProduct },
      attributes: ['id', 'indexFromSupliedProduct'],
      transaction: t,
    });

    const newProductBoxes = await ProductBox.bulkCreate(
      reqBody.boxes
        .filter(
          index =>
            !existingProductBoxes.some(
              productBox => productBox.indexFromSupliedProduct === index,
            ),
        )
        .map(index => ({
          indexFromSupliedProduct: index,
          boxSize: suppliedProduct.boxSize,
          stock: suppliedProduct.boxSize,
          productId: suppliedProduct.productId,
          warehouseId: suppliedProduct.supply.warehouseId,
          supplyId: suppliedProduct.supplyId,
          suppliedProductId: suppliedProduct.id,
        })),
      { individualHooks: false, transaction: t },
    );

    const allProducBoxes = existingProductBoxes.concat(newProductBoxes);

    suppliedProduct.suppliedQuantity = allProducBoxes.length;

    if (suppliedProduct.suppliedQuantity === suppliedProduct.quantity)
      suppliedProduct.status = status.ATTENDED;
    suppliedProduct.maxIndexSupplied = Math.max(
      ...allProducBoxes.map(
        ({ indexFromSupliedProduct }) => indexFromSupliedProduct,
      ),
    );
    await suppliedProduct.save({ transaction: t });

    await ProductBox.bulkRegisterLog(
      PRODUCTBOX_UPDATES.CREATION.value,
      reqUser,
      newProductBoxes,
      { transaction: t },
    );

    await InventoryMovement.bulkCreate(
      newProductBoxes.map(productBox => ({
        type: 'SUPPLY',
        quantity: productBox.stock,
        productId: productBox.productId,
        targetProductBoxId: productBox.id,
        toWarehouseId: productBox.warehouseId,
        targetStockBefore: 0,
        targetStockAfter: productBox.stock,
        userId: reqUser.id,
        supplyId: productBox.supplyId,
        description: 'Ingreso por abastecimiento',
      })),
      { transaction: t },
    );

    const supplyWarehouse = await Warehouse.findByPk(
      suppliedProduct.supply.warehouseId,
      { transaction: t },
    );
    let attendedProductBoxes = newProductBoxes;
    if (supplyWarehouse.type === warehouseTypes.STORE) {
      const explosionResults = [];
      for (const productBox of newProductBoxes)
        explosionResults.push(
          await moveLockedProductBox(
            { productBoxId: productBox.id, warehouseId: supplyWarehouse.id },
            reqUser,
            t,
          ),
        );
      attendedProductBoxes = explosionResults.map(result => {
        result.productBox.setDataValue('explodedLot', result.explodedLot);
        return result.productBox;
      });
    }

    await Product.updateStock(suppliedProduct.productId, { transaction: t });

    await t.commit();
    return setResponse(200, 'Supplied Product attended.', attendedProductBoxes);
  } catch (error) {
    winston.error(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Supply attend failed.');
  }
};

module.exports = { validateAttendSuppliedProduct, updateAttendSuppliedProduct };
