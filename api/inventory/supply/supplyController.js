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

module.exports = {
  getSupply,
  listSupplies,
  postSupply,
};
