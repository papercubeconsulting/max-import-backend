const Service = require('./productBarcode.service');

const getByProductId = async (req, res) => {
  const response = await Service.getByProductId(req.params, req.user);
  return res.status(response.status).send(response);
};
const getByCode = async (req, res) => {
  const response = await Service.getByCode(req.params);
  return res.status(response.status).send(response);
};

module.exports = { getByProductId, getByCode };
