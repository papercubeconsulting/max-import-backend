const { User } = require('@dbModels');

const { setResponse } = require('@root/api/utils');

const createUser = async reqBody => {
  let user = await User.findByIds(reqBody);
  if (user) return setResponse(400, 'User already exists.');
  user = await User.create(reqBody);
  return setResponse(201, 'User created.', user);
};

module.exports = {
  createUser,
};
