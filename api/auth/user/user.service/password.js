const config = require('config');
const { User } = require('@dbModels');

const { setResponse, sendEmailTemplate } = require('@root/api/utils');

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

  sendEmailTemplate(
    user.email,
    {
      name: user.name,
      url: `${config.get('clientHostname')}/resetPassword?email=${
        user.email
      }&token=${user.resetPasswordToken}`,
    },
    'resetPassword',
  );

  return setResponse(200, 'Email Sended.', {
    status: 'ok',
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
  forgotPassword,
  resetPassword,
};
