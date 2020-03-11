const winston = require('winston');
const { Op } = require('sequelize');

const sequelize = require(`${process.cwd()}/startup/db`);

const { setResponse } = require('../../../utils');

const { Supply, SuppliedProduct } = require('../supplyModel');
const ProductBox = require('../../productbox/productboxModel');

// TODO: Se debe validar que el pedido es correcto
// TODO: 1. El estado del supply es pendiente
// TODO: El id del supplied product debe pertenecer al id del supply
// TODO: Los indices deben ser menores o iguales a la cantidad de cajas

const updateAttendSuppliedProduct = async (reqBody, reqParams) => {
  const t = await sequelize.transaction();
  try {
    const suppliedProduct = await SuppliedProduct.findByPk(
      reqParams.idSuppliedProduct,
      {
        include: [
          ProductBox,
          {
            model: Supply,
          },
        ],
        transaction: t,
      },
    );

    const productBoxes = await ProductBox.findAll({
      where: { suppliedProductId: reqParams.idSuppliedProduct },
      attributes: ['id', 'indexFromSupliedProduct'],
      transaction: t,
    });

    const newProductBoxes = await ProductBox.bulkCreate(
      reqBody.boxes
        .filter(
          index =>
            !productBoxes.some(
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
      { individualHooks: true, transaction: t },
    );
    await t.commit();
    return setResponse(200, 'Supplied Product attended.', newProductBoxes);
  } catch (error) {
    winston.error(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Supply attend failed.');
  }
};

module.exports = updateAttendSuppliedProduct;
