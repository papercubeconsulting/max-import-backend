const Service = require('./bank.service');

const getBank = async (req, res) => {
  const response = await Service.getBank(req.params);
  return res.status(response.status).send(response);
};

const listBank = async (req, res) => {
  const response = await Service.listBank(req.query);
  return res.status(response.status).send(response);
};

const postBank = async (req, res) => {
  const response = await Service.postBank(req.body);
  return res.status(response.status).send(response);
};

const getBankAccount = async (req, res) => {
  const response = await Service.getBankAccount(req.params);
  return res.status(response.status).send(response);
};

const postBankAccount = async (req, res) => {
  const response = await Service.postBankAccount(req.params, req.body);
  return res.status(response.status).send(response);
};

module.exports = {
  getBank,
  listBank,
  postBank,
  getBankAccount,
  postBankAccount,
};
