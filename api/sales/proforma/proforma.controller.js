const Service = require('./proforma.service');

const getProforma = async (req, res) => {
  const response = await Service.getProforma(req.params);
  return res.status(response.status).send(response);
};

const postProforma = async (req, res) => {
  const validate = await Service.validateProforma(req.body);

  if (validate.status !== 200)
    return res.status(validate.status).send(validate);

  const response = await Service.postProforma(req.body, req.user);
  return res.status(response.status).send(response);
};

const listProforma = async (req, res) => {
  const response = await Service.listProforma(req.query);
  return res.status(response.status).send(response);
};

module.exports = {
  postProforma,
  getProforma,
  listProforma,
};
