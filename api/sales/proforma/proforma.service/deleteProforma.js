const winston = require('winston');
const {
  DiscountProforma,
  Proforma,
  ProformaProduct,
  Sale,
} = require('@dbModels');
const { sequelize } = require(`@root/startup/db`);
const { PROFORMA } = require('../../../utils/constants');
const { setResponse } = require('../../../utils');

const validateDeleteProforma = async reqParams => {
  const proforma = await Proforma.findByPk(reqParams.id, {
    include: [Sale],
  });

  if (!proforma) return setResponse(404, 'Proforma not found.');

  if (proforma.sale || proforma.status === PROFORMA.STATUS.CLOSED.value) {
    return setResponse(
      400,
      'No es posible eliminar una proforma que ya fue confirmada.',
    );
  }

  const status = proforma.checkProformaStatus();
  if (status === 'EXPIRED') {
    return setResponse(400, 'No es posible eliminar una proforma expirada.');
  }

  return setResponse(200, 'OK');
};

const deleteProforma = async reqParams => {
  const t = await sequelize.transaction();

  try {
    const proforma = await Proforma.findByPk(reqParams.id, {
      transaction: t,
    });

    await DiscountProforma.destroy({
      where: { proformaId: reqParams.id },
      transaction: t,
    });

    await ProformaProduct.destroy({
      where: { proformaId: reqParams.id },
      transaction: t,
    });

    await proforma.destroy({ transaction: t });

    await t.commit();

    return setResponse(200, 'Proforma deleted.');
  } catch (error) {
    winston.error(error);
    await t.rollback();
    return setResponse(400, 'Proforma delete failed.');
  }
};

module.exports = {
  validateDeleteProforma,
  deleteProforma,
};
