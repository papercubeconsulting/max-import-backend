const Services = require('./provider.service');

const getProvider = async (req, res) => {
  const provider = await Services.readProvider(req.params);

  return res.status(provider.status).send(provider);
};

const listProviders = async (req, res) => {
  const providers = await Services.listProviders(req.query);

  return res.status(providers.status).send(providers);
};

const postProvider = async (req, res) => {
  const provider = await Services.createProvider(req.body);

  return res.status(provider.status).send(provider);
};

module.exports = {
  getProvider,
  listProviders,
  postProvider,
};
