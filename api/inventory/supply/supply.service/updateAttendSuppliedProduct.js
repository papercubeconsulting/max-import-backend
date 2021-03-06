/* eslint-disable import/no-dynamic-require */
const winston = require('winston');
const { Supply, SuppliedProduct, ProductBox, Product } = require('@dbModels');

const { sequelize } = require(`@root/startup/db`);

const {
  supplyStatus: status,
  PRODUCTBOX_UPDATES,
} = require('../../../utils/constants');
const { setResponse } = require('../../../utils');

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

    await Product.updateStock(suppliedProduct.productId, { transaction: t });

    await t.commit();
    await ProductBox.bulkRegisterLog(
      PRODUCTBOX_UPDATES.CREATION.value,
      reqUser,
      newProductBoxes,
    );
    return setResponse(200, 'Supplied Product attended.', newProductBoxes);
  } catch (error) {
    winston.error(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Supply attend failed.');
  }
};

module.exports = { validateAttendSuppliedProduct, updateAttendSuppliedProduct };
