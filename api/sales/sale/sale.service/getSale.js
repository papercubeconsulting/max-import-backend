const { Sale, SoldProduct, Product } = require('@dbModels');
const { setResponse } = require('@root/api/utils');

const getSale = async reqParams => {
  const sale = await Sale.scope('full').findByPk(reqParams.id, {
    include: [{ all: true }, { model: SoldProduct, include: [Product] }],
  });

  if (!sale) return setResponse(404, 'Sale not found.');

  return setResponse(200, 'Sale found.', sale);
};

module.exports = {
  getSale,
};
