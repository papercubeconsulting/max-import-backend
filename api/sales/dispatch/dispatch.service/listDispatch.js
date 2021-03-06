/* eslint-disable import/no-dynamic-require */
const _ = require('lodash');
const moment = require('moment-timezone');

const {
  Proforma,
  Client,
  Sale,
  Dispatch,
  DeliveryAgency,
} = require('@dbModels');
const { Op } = require('sequelize');

const { sequelize } = require(`@root/startup/db`);
const { setResponse, paginate } = require('@/utils');

const noQueryFields = [
  // ? Para paginacion
  'page',
  'pageSize',
  // ? Para filtro de fechas
  'from',
  'to',

  // ? Filtro cliente
  'name',
  'lastname',
];

const listDispatch = async reqQuery => {
  // ? Query para el despacho
  const mainQuery = {
    ..._.omit(reqQuery, noQueryFields),
  };

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

  // ? Query para el cliente
  const clientQuery = {};
  if (reqQuery.name)
    clientQuery.name = sequelize.where(
      sequelize.fn('LOWER', sequelize.col('name')),
      'LIKE',
      `%${reqQuery.name}%`,
    );

  if (reqQuery.lastname)
    clientQuery.lastname = sequelize.where(
      sequelize.fn('LOWER', sequelize.col('lastname')),
      'LIKE',
      `%${reqQuery.lastname}%`,
    );

  const dispatches = await Dispatch.findAndCountAll({
    where: mainQuery,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Proforma,
        include: [
          {
            model: Client,
            where: clientQuery,
          },
        ],
        required: true,
      },
      Sale,
      DeliveryAgency,
    ],
    distinct: true,
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });
  dispatches.page = reqQuery.page;
  dispatches.pageSize = reqQuery.pageSize;
  dispatches.pages = _.ceil(dispatches.count / dispatches.pageSize);
  return setResponse(200, 'Dispatches found.', dispatches);
};

module.exports = { listDispatch };
