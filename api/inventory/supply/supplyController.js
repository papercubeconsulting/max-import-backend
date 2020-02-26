const Services = require('./supplyService');

const getSupply = async (req, res) => {
  const supply = await Services.readSupply(req.params);

  return res.status(supply.status).send(supply);
};

const listSupplies = async (req, res) => {
  const supplies = await Services.listSupplies(req.query);

  return res.status(supplies.status).send(supplies);
};

const postSupply = async (req, res) => {
  const supply = await Services.createSupply(req.body);

  return res.status(supply.status).send(supply);
};

const putSupply = async (req, res) => {
  const validation = await Services.validateUpdateSupply(req.body, req.params);

  if (validation.status !== 200)
    return res.status(validation.status).send(validation);

  const supply = await Services.updateSupply(
    req.body,
    req.params,
    validation.data,
  );

  return res.status(supply.status).send(supply);
};

const deleteSupply = async (req, res) => {
  const supply = await Services.deleteSupply(req.params);

  return res.status(supply.status).send(supply);
};

module.exports = {
  getSupply,
  listSupplies,
  postSupply,
  putSupply,
  deleteSupply,
};
