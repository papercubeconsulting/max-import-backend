/* eslint-disable global-require */
module.exports = {
  ...require('./inventory'),
  ...require('./management'),
  ...require('./utils'),
  ...require('./user'),
};
