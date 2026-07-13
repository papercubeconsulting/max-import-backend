const Service = require('./reconciliation.service');
const preview = async (req, res) => {
  const response = await Service.preview(req.query);
  return res.status(response.status).send(response);
};
const confirm = async (req, res) => {
  const response = await Service.confirm(req.body, req.user);
  return res.status(response.status).send(response);
};
const list = async (req, res) => {
  const response = await Service.list(req.query);
  return res.status(response.status).send(response);
};
const read = async (req, res) => {
  const response = await Service.read(req.params);
  return res.status(response.status).send(response);
};
module.exports = { preview, confirm, list, read };
