const Service = require('./deliveryAgency.service');

const getDeliveryAgency = async (req, res) => {
  const response = await Service.getDeliveryAgency(req.params);
  return res.status(response.status).send(response);
};

const listDeliveryAgency = async (req, res) => {
  const response = await Service.listDeliveryAgency(req.query);
  return res.status(response.status).send(response);
};

const postDeliveryAgency = async (req, res) => {
  const response = await Service.postDeliveryAgency(req.body);
  return res.status(response.status).send(response);
};

module.exports = {
  getDeliveryAgency,
  listDeliveryAgency,
  postDeliveryAgency,
};
