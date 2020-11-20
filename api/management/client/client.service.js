const _ = require('lodash');
const moment = require('moment-timezone');
const { Client } = require('@dbModels');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

const { setResponse, paginate } = require('../../utils');

const getClient = async reqParams => {
  const client = await Client.findOne({ where: reqParams });
  if (!client) return setResponse(404, 'Client not found.');
  return setResponse(200, 'Client found.', client);
};

const noQueryFields = ['page', 'pageSize', 'from', 'to', 'name', 'lastname'];

const listClient = async reqQuery => {
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

  if (reqQuery.name)
    mainQuery.name = sequelize.where(
      sequelize.fn('LOWER', sequelize.col('name')),
      'LIKE',
      `%${reqQuery.name}%`,
    );

  if (reqQuery.lastname)
    mainQuery.lastname = sequelize.where(
      sequelize.fn('LOWER', sequelize.col('lastname')),
      'LIKE',
      `%${reqQuery.lastname}%`,
    );

  const clients = await Client.findAndCountAll({
    where: mainQuery,
    order: [['createdAt', 'DESC']],
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });

  clients.page = reqQuery.page;
  clients.pageSize = reqQuery.pageSize;
  clients.pages = _.ceil(clients.count / clients.pageSize);

  return setResponse(200, 'Clients found.', clients);
};

const postClient = async reqBody => {
  const client = await Client.create(reqBody);
  return setResponse(200, 'Client created.', client);
};

module.exports = {
  getClient,
  listClient,
  postClient,
};
