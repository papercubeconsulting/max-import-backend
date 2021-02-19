/* eslint-disable no-restricted-syntax */
const _ = require('lodash');
const { User } = require('@dbModels');
const { Op } = require('sequelize');

const { setResponse } = require('@root/api/utils');

const findDuplicate = async (user, key, value) => {
  if (!value || user[key] === value) return null;
  const query = {};
  query[key] = value;
  const duplicate = await User.findOne({ where: query });
  return duplicate;
};

const updateUser = async (reqParams, reqBody) => {
  const user = await User.findByPk(reqParams.id);
  if (!user) return setResponse(404, 'User not found.');

  const [duplicateIdNumber, duplicateEmail] = await Promise.all([
    findDuplicate(user, 'idNumber', reqBody.idNumber),
    findDuplicate(user, 'email', reqBody.email),
  ]);

  if (duplicateIdNumber || duplicateEmail)
    return setResponse(
      404,
      'User with new email or idNumber already exists',
      {},
      'El número de identificacion o email ya existe.',
    );

  for (const key in reqBody)
    if ({}.hasOwnProperty.call(reqBody, key)) user[key] = reqBody[key];

  await user.save();

  return setResponse(200, 'User updated.', user);
};

module.exports = {
  updateUser,
};
