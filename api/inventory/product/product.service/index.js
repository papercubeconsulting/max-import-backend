/* eslint-disable global-require */
module.exports = {
  ...require('./createProduct'),
  ...require('./listProducts'),
  ...require('./readProduct'),
  ...require('./updateProduct'),
  ...require('./deleteProduct'),
};
