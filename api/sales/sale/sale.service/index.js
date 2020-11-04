/* eslint-disable global-require */
module.exports = {
  ...require('./getSale'),
  ...require('./listSale'),
  ...require('./paySale'),
  ...require('./closeProforma'),
};
