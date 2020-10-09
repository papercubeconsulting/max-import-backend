const Service = require('./dispatch.service');

const listDispatch = async (req, res) => {
  const response = await Service.listDispatch(req.query);
  return res.status(response.status).send(response);
};

const getDispatch = async (req, res) => {
  const response = await Service.getDispatch(req.params);
  return res.status(response.status).send(response);
};

module.exports = { listDispatch, getDispatch };
