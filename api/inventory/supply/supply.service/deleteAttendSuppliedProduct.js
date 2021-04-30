const { sequelize } = require(`@root/startup/db`);
const { setResponse } = require('../../../utils');

const deleteAttendSuppliedProduct = async (reqParams, reqUser) => {
  console.log(reqParams);

  return setResponse(200, 'Supplied Product attended.', {});
};

module.exports = { deleteAttendSuppliedProduct };
