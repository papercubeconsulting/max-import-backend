/* eslint-disable global-require */
module.exports = {
  ...require('./createUser'),
  ...require('./getUser'),
  ...require('./listUser'),
  ...require('./password'),
};
