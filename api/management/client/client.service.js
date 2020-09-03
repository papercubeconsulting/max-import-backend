const { clients: Client } = require('@dbModels');

const { setResponse } = require('../../utils');

const getClient = async reqParams => {
  const client = await Client.findOne({ where: reqParams });
  if (!client) return setResponse(404, 'Client not found.');
  return setResponse(200, 'Client found.', client);
};

module.exports = {
  getClient,
};
