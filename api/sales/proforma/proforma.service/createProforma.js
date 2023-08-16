const {
  Proforma,
  ProformaProduct,
  Product,
  Client,
  DiscountProforma,
} = require('@dbModels');
const { sequelize } = require(`@root/startup/db`);
const { setResponse, PROFORMA } = require('../../../utils');
const { isDiscountAllowed } = require('./discountProforma');

const validateProforma = async reqBody => {
  const productIds = reqBody.proformaProducts.map(obj => obj.productId);
  const [client, products] = await Promise.all([
    Client.findByPk(reqBody.clientId),
    Product.findAll({ where: { id: productIds } }),
  ]);
  if (!client) return setResponse(400, 'Invalid client provided');
  if (productIds.length !== products.length)
    return setResponse(400, 'Invalid productIds provided');

  return setResponse(200, 'OK');
};

const postProforma = async (reqBody, reqUser) => {
  const t = await sequelize.transaction();
  try {
    const proforma = await Proforma.create(
      { ...reqBody, userId: reqUser.id },
      { include: [ProformaProduct], transaction: t },
    );

    const { role } = reqUser.dataValues;

    // by default is already set to OPEN, but trigger beforeHook
    // to update the price values
    await proforma.update(
      { ...reqBody },
      { role, isDiscountAllowed, DiscountProforma, transaction: t },
    );

    await t.commit();

    await proforma.reload();
    // const proformaProducts = proforma.

    return setResponse(200, 'Proforma created.', proforma);
  } catch (error) {
    await t.rollback();
    return setResponse(400, 'Failed creating proforma');
  }
};

module.exports = {
  postProforma,
  validateProforma,
};
