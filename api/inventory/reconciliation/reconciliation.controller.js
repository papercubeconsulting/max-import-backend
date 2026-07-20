const Service = require('./reconciliation.service');
const preview = async (req, res) => {
  const response = await Service.preview(req.query);
  return res.status(response.status).send(response);
};
const boxes = async (req, res) => {
  const response = await Service.listEligibleBoxes(req.query);
  return res.status(response.status).send(response);
};
const confirm = async (req, res) => {
  const response = await Service.confirm(req.body, req.user);
  return res.status(response.status).send(response);
};
const approve = async (req, res) => {
  const response = await Service.approve(req.body, req.user);
  return res.status(response.status).send(response);
};
const deny = async (req, res) => {
  const response = await Service.deny(req.body, req.user);
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
module.exports = { approve, boxes, confirm, deny, list, preview, read };
