/* eslint-disable global-require */
module.exports = {
  ...require('./inventory'),
  ...require('./management'),
  ...require('./sales'),
  ...require('./utils'),
  ...require('./user'),
  ...require('./supply'),
};
