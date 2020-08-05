const { setResponse } = require('../../../utils');

const { Proforma, ProformaProduct } = require('../proforma.model');
const { Product } = require('../../../inventory/product/productModel');
const { Client } = require('../../../management/client/client.model');

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
  const proforma = await Proforma.create(
    { ...reqBody, userId: reqUser.id },
    { include: [ProformaProduct] },
  );
  await proforma.update({});
  return setResponse(200, 'Proforma created.', proforma);
};

module.exports = {
  postProforma,
  validateProforma,
};
