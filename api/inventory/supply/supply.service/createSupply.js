/* eslint-disable import/no-dynamic-require */
const winston = require('winston');
const { setResponse } = require('../../../utils');

const sequelize = require(`@root/startup/db`);

const { Supply, SuppliedProduct } = require('../supply.model');
const { Product } = require('../../product/product.model');
const { Provider } = require('../../provider/provider.model');
const { Warehouse } = require('../../warehouse/warehouse.model');

const validateCreateSupply = async reqBody => {
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
          include: {
            model: Product,
            attributes: { exclude: 'imageBase64' },
          },
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

module.exports = { createSupply, validateCreateSupply };
