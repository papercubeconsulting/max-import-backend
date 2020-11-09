const { Client } = require('@dbModels');

const { setResponse } = require('../../utils');

const getClient = async reqParams => {
  const client = await Client.findOne({ where: reqParams });
  if (!client) return setResponse(404, 'Client not found.');
  return setResponse(200, 'Client found.', client);
};

const listClient = async reqQuery => {
  const clients = await Client.findAll(reqQuery);
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
