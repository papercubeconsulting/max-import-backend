/* eslint-disable global-require */
module.exports = {
  ...require('./createProforma'),
  ...require('./readProforma'),
  ...require('./listProforma'),
  ...require('./updateProforma'),

  // TODO: Comment
  // * No para produccion
  ...require('./_seedCreateProforma'),
};
