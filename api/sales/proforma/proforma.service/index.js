/* eslint-disable global-require */
module.exports = {
  ...require('./createProforma'),
  ...require('./readProforma'),
  ...require('./listProforma'),
  ...require('./updateProforma'),

  // TODO: REMOVE BECAUSE IS JUST FOR SEEDING
  ...require('./_seedCreateProforma'),
};
