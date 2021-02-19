const { User } = require('@dbModels');

const { setResponse } = require('@root/api/utils');

const readUser = async (reqParams, options) => {
  const user = await User.findByPk(reqParams.id, options);
  if (!user) return setResponse(404, 'User not found.');
  return setResponse(200, 'User found.', user);
};

const readUserByIds = async (reqParams, scope) => {
  const user = await User.findByIds(reqParams, scope);
  if (!user) return setResponse(404, 'User not found.');
  return setResponse(200, 'User found.', user);
};

module.exports = {
  readUser,
  readUserByIds,
};
