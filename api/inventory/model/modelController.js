const Services = require('./modelService');

const getModel = async (req, res) => {
  const model = await Services.readModel(req.params);

  return res.status(model.status).send(model);
};

const listModels = async (req, res) => {
  const models = await Services.listModels(req.query);

  return res.status(models.status).send(models);
};

const postModel = async (req, res) => {
  const model = await Services.createModel(req.body);

  return res.status(model.status).send(model);
};

module.exports = {
  getModel,
  listModels,
  postModel,
};
