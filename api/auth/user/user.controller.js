const Service = require('./user.service');

const getUserMe = async (req, res) => {
  const response = await Service.readUser({ id: req.user.id });
  return res.status(response.status).send(response);
};

const listUsers = async (req, res) => {
  const response = await Service.listUsers(req.query);
  return res.status(response.status).send(response);
};

const readUser = async (req, res) => {
  const response = await Service.readUser(req.params);
  return res.status(response.status).send(response);
};

const createUser = async (req, res) => {
  const response = await Service.createUser(req.body);
  return res.status(response.status).send(response);
};

const updateUser = async (req, res) => {
  const response = await Service.updateUser(req.params, req.body);
  return res.status(response.status).send(response);
};

const forgotPassword = async (req, res) => {
  const response = await Service.forgotPassword(req.body);

  return res.status(response.status).send(response);
};

const resetPassword = async (req, res) => {
  const response = await Service.resetPassword(req.body);

  return res.status(response.status).send(response);
};

module.exports = {
  getUserMe,
  listUsers,
  readUser,
  createUser,
  forgotPassword,
  resetPassword,
  updateUser,
};
