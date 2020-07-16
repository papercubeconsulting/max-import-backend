const Service = require('./geography.service');

const listRegions = async (req, res) => {
  const response = Service.listRegions(req.params);
  return res.status(response.status).send(response);
};

const listProvinces = async (req, res) => {
  const response = Service.listProvinces(req.params);
  return res.status(response.status).send(response);
};

const listDistricts = async (req, res) => {
  const response = Service.listDistricts(req.params);
  return res.status(response.status).send(response);
};

module.exports = { listRegions, listProvinces, listDistricts };
