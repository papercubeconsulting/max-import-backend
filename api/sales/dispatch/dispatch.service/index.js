/* eslint-disable global-require */
module.exports = {
  ...require('./getDispatch'),
  ...require('./listDispatch'),
  ...require('./postDispatchProductBox'),
  ...require('./postFinishDispatch'),
};
