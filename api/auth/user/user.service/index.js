/* eslint-disable global-require */
module.exports = {
  ...require('./createUser'),
  ...require('./updateUser'),
  ...require('./getUser'),
  ...require('./listUser'),
  ...require('./password'),
};
