/* eslint-disable global-require */
module.exports = {
  ...require('./readSupply'),
  ...require('./listSupplies'),
  ...require('./createSupply'),
  ...require('./validateUpdateSupply'),
  ...require('./updateSupply'),
  ...require('./updateSupplyStatus'),
  ...require('./deleteSupply'),
  ...require('./updateAttendSuppliedProduct'),
  ...require('./fullCreateSupply'),
};
