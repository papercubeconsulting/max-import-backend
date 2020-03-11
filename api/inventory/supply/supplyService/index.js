/* eslint-disable global-require */
module.exports = {
  readSupply: require('./readSupply'),
  listSupplies: require('./listSupplies'),
  createSupply: require('./createSupply'),
  validateUpdateSupply: require('./validateUpdateSupply'),
  updateSupply: require('./updateSupply'),
  updateSupplyStatus: require('./updateSupplyStatus'),
  deleteSupply: require('./deleteSupply'),
  ...require('./updateAttendSuppliedProduct'),
};
