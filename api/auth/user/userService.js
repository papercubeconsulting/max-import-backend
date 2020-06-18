const _ = require('lodash');

const { setResponse } = require('../../utils');

const { User } = require('./userModel');

const readUser = async reqParams => {
  const user = await User.findByPk(reqParams.id);
  if (!user) return setResponse(404, 'User not found.');
  return setResponse(200, 'User found.', user);
};

const readUserByIds = async reqParams => {
  const user = await User.findByIds(reqParams);
  if (!user) return setResponse(404, 'User not found.');
  return setResponse(200, 'User found.', user);
};

const listUsers = async reqQuery => {
  const users = await User.findAll({
    where: reqQuery,
  });

  return setResponse(200, 'Users found.', users);
};

const createUser = async reqBody => {
  let user = await User.findByIds(_.pick(reqBody, ['idNumber', 'email']));
  if (user) return setResponse(400, 'User already exists.');
  user = await User.create(reqBody);
  return setResponse(201, 'User created.', user);
};

module.exports = {
  readUser,
  listUsers,
  createUser,
  readUserByIds,
};
