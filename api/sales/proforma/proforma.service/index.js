/* eslint-disable global-require */
module.exports = {
  ...require('./createProforma'),
  ...require('./readProforma'),
  ...require('./listProforma'),

  // TODO: Comment
  // * No para produccion
  ...require('./_seedCreateProforma'),
};
