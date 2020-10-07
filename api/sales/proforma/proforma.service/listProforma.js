const _ = require('lodash');
const moment = require('moment-timezone');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

const { Proforma, User, Client, Sale, DeliveryAgency } = require('@dbModels');

const { setResponse, paginate } = require('../../../utils');

const noQueryFields = ['page', 'pageSize', 'from', 'to', 'name', 'lastname'];

const listProforma = async reqQuery => {
  // ? Query para la proforma
  const mainQuery = {
    ..._.omit(reqQuery, noQueryFields),

    createdAt: {
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
    },
  };

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

  const proformas = await Proforma.findAndCountAll({
    where: mainQuery,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Client,
        where: clientQuery,
        attributes: ['id', 'name', 'lastname'],
      },
      { model: User, attributes: ['id', 'name', 'lastname'] },
      { model: Sale, include: [DeliveryAgency] },
    ],
    distinct: true,
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });
  proformas.page = reqQuery.page;
  proformas.pageSize = reqQuery.pageSize;
  proformas.pages = _.ceil(proformas.count / proformas.pageSize);
  return setResponse(200, 'Proformas found.', proformas);
};

module.exports = {
  listProforma,
};
