const Service = require('./proforma.service');

const getProforma = async (req, res) => {
  const supply = await Service.getProforma(req.params);
  return res.status(supply.status).send(supply);
};

const postProforma = async (req, res) => {
  const validate = await Service.validateProforma(req.body);

  if (validate.status !== 200)
    return res.status(validate.status).send(validate);

  const proforma = await Service.postProforma(req.body, req.user);
  return res.status(proforma.status).send(proforma);
};

module.exports = {
  postProforma,
  getProforma,
};
