const { setResponse } = require('../../utils');

const Provider = require('./providerModel');

const readProvider = async reqParams => {
  const provider = await Provider.findByPk(reqParams.id);
  if (!provider) return setResponse(400, 'Provider not found.');

  return setResponse(200, 'Provider found.', provider);
};

const listProviders = async reqQuery => {
  const providers = await Provider.findAll({});

  return setResponse(200, 'Providers found.', providers);
};

const createProvider = async reqBody => {
  let provider = await Provider.findOne({ where: { name: reqBody.name } });
  if (provider) return setResponse(400, 'Provider already exists.');

  provider = await Provider.create(reqBody);

  return setResponse(201, 'Provider created.', provider);
};

module.exports = {
  readProvider,
  listProviders,
  createProvider,
};
