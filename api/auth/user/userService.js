const _ = require('lodash');
const moment = require('moment-timezone');

const { setResponse } = require('../../utils');

const { User } = require('./userModel');

const readUser = async reqParams => {
  const user = await User.findByPk(reqParams.id);
  if (!user) return setResponse(404, 'User not found.');
  return setResponse(200, 'User found.', user);
};

const readUserByIds = async (reqParams, scope) => {
  const user = await User.findByIds(reqParams, scope);
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
  let user = await User.findByIds(reqBody);
  if (user) return setResponse(400, 'User already exists.');
  user = await User.create(reqBody);
  return setResponse(201, 'User created.', user);
};

const forgotPassword = async reqBody => {
  const user = await User.findByIds(reqBody);
  if (!user)
    return setResponse(
      404,
      'User not found.',
      {},
      'El correo ingresado no pertenece a ningún usuario',
    );

  await user.generatePasswordResetToken();

  // TODO: Enviar correo
  // TODO: Borrar code de respuesta

  return setResponse(200, 'Email Sended.', {
    status: 'ok',
    code: user.resetPasswordToken,
  });
};

const resetPassword = async reqBody => {
  const user = await User.findByIds(reqBody, 'full');
  if (!user)
    return setResponse(
      404,
      'User not found.',
      {},
      'El correo ingresado no pertenece a ningún usuario',
    );
  const { success, message } = await user.updatePasswordByToken(reqBody);
  if (!success) return setResponse(400, message);

  return setResponse(200, 'Password updated.', { status: 'ok' });
};

module.exports = {
  readUser,
  listUsers,
  createUser,
  readUserByIds,
  forgotPassword,
  resetPassword,
};
