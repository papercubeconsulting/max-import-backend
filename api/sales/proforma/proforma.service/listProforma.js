const _ = require('lodash');
const moment = require('moment-timezone');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

const { Proforma, User, Client, Sale, DeliveryAgency } = require('@dbModels');

const { setResponse, paginate } = require('../../../utils');

const noQueryFields = [
  'page',
  'pageSize',
  'from',
  'to',
  'name',
  'lastname',
  'idNumber',
];

const listProforma = async reqQuery => {
  // ? Query para la proforma
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

  if (reqQuery.idNumber) {
    clientQuery.idNumber = sequelize.where(
      sequelize.fn('LOWER', sequelize.col('idNumber')),
      'LIKE',
      `%${reqQuery.idNumber}%`,
    );
  }

  const proformas = await Proforma.findAndCountAll({
    where: mainQuery,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Client,
        where: clientQuery,
        attributes: ['id', 'name', 'lastname', 'idNumber'],
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
