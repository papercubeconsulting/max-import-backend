const Services = require('./productGroup.service');

const getProductGroup = async (req, res) => {
  const productGroup = await Services.readProductGroup(req.params);

  return res.status(productGroup.status).send(productGroup);
};

const listProductGroups = async (req, res) => {
  const productGroups = await Services.listProductGroups(req.query);

  return res.status(productGroups.status).send(productGroups);
};

const postProductGroup = async (req, res) => {
  const productGroup = await Services.createProductGroup(req.body);

  return res.status(productGroup.status).send(productGroup);
};

const putProductGroup = async (req, res) => {
  const productGroup = await Services.updateProductGroup(req.params, req.body);

  return res.status(productGroup.status).send(productGroup);
};

module.exports = {
  getProductGroup,
  listProductGroups,
  postProductGroup,
  putProductGroup,
};
