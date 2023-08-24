/* eslint-disable no-unused-vars */
const {
  Proforma,
  ProformaProduct,
  Product,
  Client,
  DiscountProforma,
} = require('@dbModels');
const { setResponse } = require('../../../utils');

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

  // get a discount proforma data that hasn't been aproved (userId: null)
  const discountProforma = await DiscountProforma.findOne({
    where: { proformaId: reqParams.id, userId: null },
  });

  if (!proforma) return setResponse(404, 'Proforma not found.');
  return setResponse(200, 'Proforma found.', {
    ...proforma.get(),
    ...(discountProforma ? { discountProforma } : {}),
  });
};
module.exports = {
  getProforma,
};
