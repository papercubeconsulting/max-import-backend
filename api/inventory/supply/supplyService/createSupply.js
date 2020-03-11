const winston = require('winston');
const { setResponse } = require('../../../utils');

const sequelize = require(`${process.cwd()}/startup/db`);

const { Supply, SuppliedProduct } = require('../supplyModel');
const Product = require('../../product/productModel');
const Provider = require('../../provider/providerModel');
const Warehouse = require('../../warehouse/warehouseModel');

const createSupply = async reqBody => {
  const t = await sequelize.transaction();

  try {
    let supply = await Supply.create(reqBody, { transaction: t });
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

    return setResponse(201, 'Supply created.', supply);
  } catch (error) {
    winston.error(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Supply updated failed.');
  }
};

module.exports = createSupply;
