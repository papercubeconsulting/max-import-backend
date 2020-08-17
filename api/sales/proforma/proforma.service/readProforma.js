/* eslint-disable no-unused-vars */
const { setResponse } = require('../../../utils');

const { Proforma, ProformaProduct } = require('../proforma.model');
const { Product } = require('../../../inventory/product/product.model');
const { Client } = require('../../../management/client/client.model');

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
