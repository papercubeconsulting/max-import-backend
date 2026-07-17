/* eslint-disable import/no-dynamic-require */
const winston = require('winston');
const {
  Supply,
  SupplyLog,
  SuppliedProduct,
  Product,
  Provider,
  Warehouse,
} = require('@dbModels');
const { SUPPLY_LOGS, supplyTypes } = require('@/utils/constants');
const {
  StoreReturnError,
  validateStoreReturnRequest,
} = require('./storeReturn');

const { sequelize } = require(`@root/startup/db`);

const { setResponse } = require('../../../utils');

const _ = require('lodash');

const validateCreateSupply = async reqBody => {
  if (reqBody.type === supplyTypes.STORE_RETURN) {
    try {
      await validateStoreReturnRequest(reqBody);
      return setResponse(200, 'Ok');
    } catch (error) {
      if (error instanceof StoreReturnError)
        return setResponse(error.status, 'Invalid store return.', null, error.message);
      throw error;
    }
  }
  const productIds = Array.from(
    new Set(reqBody.suppliedProducts.map(obj => obj.productId)),
  );
  const products = await Product.findAll({ where: { id: productIds } });
  if (productIds.length !== products.length)
    return setResponse(400, 'Invalid productIds provided');
  if (products.some(prod => prod.providerId !== reqBody.providerId))
    return setResponse(400, 'Invalid providerId for selected products');
  return setResponse(200, 'Ok');
};

const createSupply = async (reqBody, reqUser) => {
  const t = await sequelize.transaction();

  try {
    const body = {
      ...reqBody,
      type: reqBody.type || supplyTypes.NORMAL,
      sourceWarehouseId:
        reqBody.type === supplyTypes.STORE_RETURN
          ? reqBody.sourceWarehouseId
          : null,
      providerId:
        reqBody.type === supplyTypes.STORE_RETURN ? null : reqBody.providerId,
    };
    let supply = await Supply.create(body, { transaction: t });
    await SuppliedProduct.bulkCreate(
      reqBody.suppliedProducts.map(obj => ({ ...obj, supplyId: supply.id, initQuantity: obj.quantity, initBoxSize: obj.boxSize })),
      { transaction: t },
    );

    // * Update object with nested entities
    supply = await Supply.findByPk(supply.id, {
      include: [
        Warehouse,
        { model: Warehouse, as: 'sourceWarehouse' },
        Provider,
        {
          model: SuppliedProduct,
          include: {
            model: Product,
            attributes: {
              exclude: ['imageBase64', 'secondImageBase64', 'thirdImageBase64'],
            },
          },
        },
      ],
      transaction: t,
    });

    await SupplyLog.create({
      log: `${SUPPLY_LOGS.CREATE.LOG}`,
      action: SUPPLY_LOGS.CREATE.ACTION,
      detail: '-',
      userId: _.get(reqUser, 'id', reqUser),
      supplyId: supply.id,
    }, { transaction: t });

    // If the execution reaches this line, no errors were thrown.
    // We commit the transaction.
    await t.commit();

    return setResponse(201, 'Supply created.', supply);
  } catch (error) {
    //winston.error(error);
    console.log(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Supply creation failed.');
  }
};

module.exports = { createSupply, validateCreateSupply };
