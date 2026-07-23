const Service = require('./unitTicketPrint.service');
const create = async (req, res) => {
  const response = await Service.create(req.body, req.user);
  return res.status(response.status).send(response);
};
const createExplodedBoxBatch = async (req, res) => {
  const response = await Service.createExplodedBoxBatch(req.body, req.user);
  return res.status(response.status).send(response);
};
const read = async (req, res) => {
  const response = await Service.read(req.params);
  return res.status(response.status).send(response);
};
const list = async (req, res) => {
  const response = await Service.list(req.query);
  return res.status(response.status).send(response);
};
module.exports = { create, createExplodedBoxBatch, read, list };
