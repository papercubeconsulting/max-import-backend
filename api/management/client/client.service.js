const { setResponse } = require('../../utils');

const { Client } = require('./client.model');

const getClient = async reqParams => {
  const client = await Client.findOne({ where: reqParams });
  if (!client) return setResponse(404, 'Client not found.');
  return setResponse(200, 'Client found.', client);
};

module.exports = {
  getClient,
};