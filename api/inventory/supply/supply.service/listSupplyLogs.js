const { SupplyLog, User } = require('@dbModels');
const _ = require('lodash');
const { setResponse, paginate } = require('../../../utils');

const supplyLogFields = ['supplyId'];
const listSupplyLogs = async reqQuery => {
  const supplyLogs = await SupplyLog.findAll({
    where: _.pick(reqQuery, supplyLogFields),
    order: [['createdAt', 'ASC']],
    include: [{ model: User, attributes: ['name', 'lastname'] }],
  });
  return setResponse(200, 'SupplyLogs found.', supplyLogs);
};

module.exports = { listSupplyLogs };
