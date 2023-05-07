/* eslint-disable no-param-reassign */
/* eslint-disable import/no-dynamic-require */
const _ = require('lodash');
const winston = require('winston');

const {
  Supply,
  SupplyLog,
  SuppliedProduct,
  Product,
  Provider,
  Warehouse,
} = require('@dbModels');

const { sequelize } = require(`@root/startup/db`);

const { setResponse } = require('../../../utils');
const { SUPPLY_LOGS } = require('@/utils/constants');

// ? Servicio para actualiza campos del abastecimiento y añadir/remover productos
// ? El abastecimiento debe estar sin atender
const updateSupply = async (reqBody, reqParams, validatedData, reqUser) => {
  const t = await sequelize.transaction();

  try {
    await Supply.update(_.omit(reqBody, ['suppliedProducts']), {
      where: { id: reqParams.id },
      transaction: t,
    });

    const promises = [];

    // * Remove items
    validatedData.deleteSuppliedProducts.reduce((acc, cur) => {
      acc.push(
        SuppliedProduct.destroy({ where: { id: cur.id }, transaction: t }),
        SupplyLog.create({
          log: `${SUPPLY_LOGS.DELETE_PRODUCT.LOG}`,
          action: SUPPLY_LOGS.DELETE_PRODUCT.ACTION,
          detail: `${SUPPLY_LOGS.DELETE_PRODUCT.DETAIL}: ${cur.product.code}`,
          userId: _.get(reqUser, 'id', reqUser),
          supplyId: reqParams.id,
        }),
      );
      return acc;
    }, promises);


    // * Update items (cantidad de cajas)
    validatedData.updateSuppliedProducts.reduce((acc, cur) => {
      const queryProd = reqBody.suppliedProducts.find(
        qProd =>
          cur.productId === qProd.productId && cur.boxSize === qProd.boxSize,
      );
      acc.push(
        SuppliedProduct.update(
          { quantity: queryProd.quantity },
          { where: { id: cur.id }, transaction: t },
        ),
      );
      return acc;
    }, promises);

    // * Crear nuevos items
    promises.push(
      SuppliedProduct.bulkCreate(
        validatedData.newSuppliedProducts.map(row => {
          row.supplyId = reqParams.id;
          return row;
        }),
        { transaction: t },
      ),
    );

    await Promise.all(promises);

    // If the execution reaches this line, no errors were thrown.
    // We commit the transaction.
    await t.commit();

    const supply = await Supply.findByPk(reqParams.id, {
      include: [
        Warehouse,
        Provider,
        {
          model: SuppliedProduct,
          include: Product,
        },
      ],
    });

    return setResponse(200, 'Supply updated.', supply);
  } catch (error) {
    winston.error(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Supply updated failed.');
  }
};

module.exports = { updateSupply };
