/* eslint-disable import/no-dynamic-require */
const _ = require('lodash');
const moment = require('moment-timezone');

const { Proforma, Client, Sale, User } = require('@dbModels');
const { Op } = require('sequelize');

const { setResponse, paginate } = require('@root/api/utils');

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

module.exports = { listSale };
