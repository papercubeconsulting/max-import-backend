/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-dynamic-require */
const { Proforma, ProformaProduct } = require('@dbModels');

const { setResponse } = require('../../../utils');

const _seedCreateProforma = async reqBody => {
  const proforma = await Proforma.create(reqBody, {
    include: [ProformaProduct],
  });
  await proforma.update({});
  return setResponse(200, 'Proforma created.', proforma);
};

module.exports = { _seedCreateProforma };
