const Services = require('./subfamily.service');

const getSubfamily = async (req, res) => {
  const subfamily = await Services.readSubfamily(req.params);

  return res.status(subfamily.status).send(subfamily);
};

const listSubfamilies = async (req, res) => {
  const subfamilies = await Services.listSubfamilies(req.query);

  return res.status(subfamilies.status).send(subfamilies);
};

const postSubfamily = async (req, res) => {
  const subfamily = await Services.createSubfamily(req.body);

  return res.status(subfamily.status).send(subfamily);
};

module.exports = {
  getSubfamily,
  listSubfamilies,
  postSubfamily,
};
