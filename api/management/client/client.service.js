const _ = require('lodash');
const { Client } = require('@dbModels');

const { setResponse, paginate } = require('../../utils');

const getClient = async reqParams => {
  const client = await Client.findOne({ where: reqParams });
  if (!client) return setResponse(404, 'Client not found.');
  return setResponse(200, 'Client found.', client);
};

const noQueryFields = ['page', 'pageSize', 'from', 'to'];

const listClient = async reqQuery => {
  const mainQuery = {
    ..._.omit(reqQuery, noQueryFields),
  };

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
