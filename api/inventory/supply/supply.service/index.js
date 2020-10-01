/* eslint-disable global-require */
module.exports = {
  ...require('./createSupply'),
  ...require('./deleteSupply'),
  ...require('./_fullCreateSupply'),
  ...require('./listSupplies'),
  ...require('./readSupply'),
  ...require('./updateAttendSuppliedProduct'),
  ...require('./updateSupply'),
  ...require('./updateSupplyStatus'),
  ...require('./validateUpdateSupply'),
};
