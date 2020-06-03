/* eslint-disable import/no-dynamic-require */
const winston = require('winston');

const sequelize = require(`${process.cwd()}/startup/db`);

const { setResponse } = require('../../../utils');

const { Supply, SuppliedProduct } = require('../supplyModel');
const { Product } = require('../../product/productModel');
const { ProductBox } = require('../../productbox/productboxModel');
const { Provider } = require('../../provider/providerModel');
const { Warehouse } = require('../../warehouse/warehouseModel');

const {
  updateAttendSuppliedProduct,
} = require('./updateAttendSuppliedProduct');

const updateSupplyStatus = require('./updateSupplyStatus');

const { supplyStatus } = require('../../../utils/constants');

const foo = async (reqBody, reqParams, t) => {
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
    { individualHooks: true, transaction: t },
  );

  const allProducBoxes = existingProductBoxes.concat(newProductBoxes);

  suppliedProduct.suppliedQuantity = allProducBoxes.length;
  suppliedProduct.maxIndexSupplied = Math.max(
    ...allProducBoxes.map(
      ({ indexFromSupliedProduct }) => indexFromSupliedProduct,
    ),
  );
  await suppliedProduct.save({ transaction: t });
};

const fullCreateSupply = async reqBody => {
  const t = await sequelize.transaction();
  const { status } = reqBody;
  let supply;
  try {
    supply = await Supply.create(
      { ...reqBody, status: supplyStatus.PENDING },
      { transaction: t },
    );

    await SuppliedProduct.bulkCreate(
      reqBody.suppliedProducts.map(obj => ({ ...obj, supplyId: supply.id })),
      { transaction: t },
    );

    // * Update object with nested entities
    supply = await Supply.findByPk(supply.id, {
      include: [
        Warehouse,
        Provider,
        {
          model: SuppliedProduct,
          include: Product,
        },
      ],
      transaction: t,
    });

    // If the execution reaches this line, no errors were thrown.
    // We commit the transaction.
    await t.commit();
  } catch (error) {
    winston.error(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Supply updated failed.');
  }

  if (status === supplyStatus.ATTENDED) {
    await Promise.all(
      supply.suppliedProducts.map(obj => {
        return updateAttendSuppliedProduct(
          { boxes: [...Array(obj.quantity).keys()].map(x => ++x) },
          { id: supply.id, idSuppliedProduct: obj.id },
        );
      }),
    );
    const x = await updateSupplyStatus(
      { status: supplyStatus.ATTENDED },
      { id: supply.id },
    );
  }

  return setResponse(201, 'Supply created.', supply);
};

module.exports = { fullCreateSupply };
