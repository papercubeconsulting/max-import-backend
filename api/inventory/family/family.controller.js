const Services = require('./family.service');

const getFamily = async (req, res) => {
  const family = await Services.readFamily(req.params);

  return res.status(family.status).send(family);
};

const listFamilies = async (req, res) => {
  const families = await Services.listFamilies(req.query);

  return res.status(families.status).send(families);
};

const postFamily = async (req, res) => {
  const family = await Services.createFamily(req.body);

  return res.status(family.status).send(family);
};

module.exports = {
  getFamily,
  listFamilies,
  postFamily,
};
