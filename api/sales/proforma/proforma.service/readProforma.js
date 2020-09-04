/* eslint-disable no-unused-vars */
const { setResponse } = require('../../../utils');

const { Proforma, ProformaProduct, Product, Client } = require('@dbModels');

const getProforma = async reqParams => {
  const proforma = await Proforma.findByPk(reqParams.id, {
    include: [
      { all: true },
      {
        model: ProformaProduct,
        include: {
          model: Product,
        },
      },
    ],
  });

  if (!proforma) return setResponse(404, 'Proforma not found.');
  return setResponse(200, 'Proforma found.', proforma);
};
module.exports = {
  getProforma,
};
