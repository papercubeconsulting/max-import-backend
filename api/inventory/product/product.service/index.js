/* eslint-disable global-require */
module.exports = {
  ...require('./createProduct'),
  ...require('./listProducts'),
  ...require('./readProduct'),
  ...require('./updateProduct'),
  ...require('./deleteProduct'),
  ...require('./getInventoryReport'),
  ...require('./uploadCsvProduct'),
};
