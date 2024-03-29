const winston = require('winston');

const { Proforma } = require('@dbModels');

const { sequelize } = require(`@root/startup/db`);
const { setResponse } = require('@root/api/utils');
const { PROFORMA, SALE } = require('@root/api/utils/constants');

const closeProforma = async (reqBody, reqUser) => {
  const t = await sequelize.transaction();

  try {
    const proforma = await Proforma.findByPk(reqBody.proformaId, {
      transaction: t,
    });
    // ? Se valida que el estado de la proforma no este en PENDING_DISCOUNT_APPROVAL
    if (proforma.status === PROFORMA.STATUS.PENDING_DISCOUNT_APPROVAL.value) {
      await t.rollback();
      return setResponse(
        400,
        'Pending approval for discount.',
        null,
        'Proforma pendiente de aprobacion de descuento.',
      );
    }

    // ? Se valida que el estado de la proforma no haya pasado a cerrada
    if (proforma.status === PROFORMA.STATUS.CLOSED.value) {
      await t.rollback();
      return setResponse(
        400,
        'Proforma already closed',
        null,
        'La proforma ya ha sido cerrada.',
      );
    }

    // ? Se valida que el monto a pagar no exceda el monto de la proforma
    if (reqBody.initialPayment > proforma.total) {
      await t.rollback();
      return setResponse(
        400,
        'Invalid initialPayment.',
        null,
        'El monto ingresado A Cuenta excede el total de la proforma',
      );
    }

    // ? Se valida que el tipo de pago coincida con el monto de credito
    // ? Si el tipo de pago es CREDIT, el pago inicial NO debe ser igual al total
    // ? Si el tipo de pago es CASH, el pago inicial debe ser distinto al total
    if (
      (reqBody.paymentType === SALE.PAYMENT_TYPE.CREDIT.value &&
        reqBody.initialPayment === proforma.total) ||
      (reqBody.paymentType === SALE.PAYMENT_TYPE.CASH.value &&
        reqBody.initialPayment !== proforma.total)
    ) {
      await t.rollback();
      return setResponse(
        400,
        'Invalid paymentType.',
        null,
        'El monto ingresado A Cuenta no corresponde al tipo de pago.',
      );
    }

    // ? Se valida el stock de los productos
    const check = await proforma.checkStock({ transaction: t });
    if (!check) {
      await t.rollback();
      return setResponse(
        400,
        'No stock available.',
        null,
        'No hay stock para alguno de los productos, actualice para validar el stock disponible.',
      );
    }

    // ? Se procede a cerrar la proforma

    await proforma.closeProforma(
      { ...reqBody, sellerId: reqUser.id },
      { transaction: t },
    );

    const sale = await proforma.getSale({
      include: { all: true },
      transaction: t,
    });

    await t.commit();
    return setResponse(200, 'Proforma sold.', sale);
  } catch (error) {
    winston.error(error);
    await t.rollback();
    return setResponse(400, 'Proforma sale failed.');
  }
};

module.exports = {
  closeProforma,
};
