/* eslint-disable import/no-dynamic-require */
const _ = require('lodash');
const moment = require('moment-timezone');
const winston = require('winston');

const { Proforma, Client, Sale, User } = require('@dbModels');
const { Op } = require('sequelize');

const { sequelize } = require(`@root/startup/db`);
const { setResponse, paginate } = require('../../utils');

const { PROFORMA, SALE } = require('../../utils/constants');

const noQueryFields = [
  // ? Para paginacion
  'page',
  'pageSize',
  // ? Para filtro de fechas
  'paidAtFrom',
  'paidAtTo',
  'from',
  'to',

  // ? Para creterio de ordenamiento
  'orderBy',
];

const closeProforma = async (reqBody, reqUser) => {
  const t = await sequelize.transaction();

  try {
    const proforma = await Proforma.findByPk(reqBody.proformaId, {
      transaction: t,
    });
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

const listSale = async reqQuery => {
  // ? Query para la venta
  const mainQuery = { ..._.omit(reqQuery, noQueryFields) };

  // ? Se filtra la fecha de pago solo si los campos estan presentes
  if (reqQuery.paidAtFrom) {
    mainQuery.paidAt = {
      [Op.between]: [
        moment
          .tz(
            moment.utc(reqQuery.paidAtFrom).format('YYYY-MM-DD'),
            'America/Lima',
          )
          .startOf('day')
          .toDate(),
        moment
          .tz(
            moment.utc(reqQuery.paidAtTo).format('YYYY-MM-DD'),
            'America/Lima',
          )
          .endOf('day')
          .toDate(),
      ],
    };
  }

  // ? Se filtra la fecha de creacion solo si los campos estan presentes
  if (reqQuery.from) {
    mainQuery.createdAt = {
      [Op.between]: [
        moment
          .tz(moment.utc(reqQuery.from).format('YYYY-MM-DD'), 'America/Lima')
          .startOf('day')
          .toDate(),
        moment
          .tz(moment.utc(reqQuery.to).format('YYYY-MM-DD'), 'America/Lima')
          .endOf('day')
          .toDate(),
      ],
    };
  }

  const sales = await Sale.findAndCountAll({
    where: mainQuery,
    order: reqQuery.orderBy,
    include: [
      { model: Proforma, include: [Client] },
      { model: User, as: 'cashier' },
      { model: User, as: 'seller' },
    ],
    distinct: true,
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });
  sales.page = reqQuery.page;
  sales.pageSize = reqQuery.pageSize;
  sales.pages = _.ceil(sales.count / sales.pageSize);
  return setResponse(200, 'Sales found.', sales);
};

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
  closeProforma,
  listSale,
  validatePaySale,
  paySale,
};
