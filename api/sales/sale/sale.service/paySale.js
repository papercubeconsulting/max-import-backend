const { Sale } = require('@dbModels');
const { setResponse } = require('@root/api/utils');

const { SALE } = require('@root/api/utils/constants');

const validatePaySale = async (reqParams, reqBody) => {
  const sale = await Sale.findByPk(reqParams.id);
  if (!sale) return setResponse(404, 'Sale not found.');

  // ? Se valida que la venta no haya sido pagada
  if (sale.status === SALE.STATUS.PAID.value)
    return setResponse(
      400,
      'Sale already paid.',
      null,
      'La venta ya ha sido pagada',
    );

  // ? Se valida que el monto por pagar no exceda el total
  if (reqBody.initialPayment > sale.total)
    return setResponse(
      400,
      'Invalid initialPayment.',
      null,
      'El monto ingresado A Cuenta excede el total de la proforma',
    );

  // ? Se valida que el monto de pago no contradiga el tipo de pago
  if (
    (reqBody.paymentType === SALE.PAYMENT_TYPE.CREDIT.value &&
      reqBody.initialPayment === sale.total) ||
    (reqBody.paymentType === SALE.PAYMENT_TYPE.CASH.value &&
      reqBody.initialPayment !== sale.total)
  ) {
    return setResponse(
      400,
      'Invalid paymentType.',
      null,
      'El monto ingresado A Cuenta no corresponde al tipo de pago.',
    );
  }

  return setResponse(200, 'ok');
};

const paySale = async (reqParams, reqBody, reqUser) => {
  const sale = await Sale.findByPk(reqParams.id);
  await sale.pay({ ...reqBody, cashierId: reqUser.id });

  return setResponse(200, 'Sale paid.', sale);
};

module.exports = {
  validatePaySale,
  paySale,
};
