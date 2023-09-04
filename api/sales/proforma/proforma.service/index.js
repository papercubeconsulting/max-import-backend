/* eslint-disable global-require */
module.exports = {
  ...require('./createProforma'),
  ...require('./readProforma'),
  ...require('./listProforma'),
  ...require('./updateProforma'),
  ...require('./sendPdf'),
  ...require('./discountProforma'),
  ...require('./downloadPdf'),

  // TODO: REMOVE BECAUSE IS JUST FOR SEEDING
  ...require('./_seedCreateProforma'),
};
