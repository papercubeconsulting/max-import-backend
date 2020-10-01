/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-dynamic-require */
const winston = require('winston');

const {
  Supply,
  SuppliedProduct,
  Product,
  Provider,
  Warehouse,
} = require('@dbModels');

const { sequelize } = require(`@root/startup/db`);

const { setResponse } = require('../../../utils');

const {
  updateAttendSuppliedProduct,
} = require('./updateAttendSuppliedProduct');

const { updateSupplyStatus } = require('./updateSupplyStatus');

const { supplyStatus } = require('../../../utils/constants');

const _fullCreateSupply = async (reqBody, reqUser) => {
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
          reqUser,
        );
      }),
    );
    await updateSupplyStatus(
      { status: supplyStatus.ATTENDED },
      { id: supply.id },
    );
  }

  return setResponse(201, 'Supply created.', supply);
};

module.exports = { _fullCreateSupply };
