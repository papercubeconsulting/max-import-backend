const _ = require('lodash');
const moment = require('moment-timezone');

const {
  Supply,
  SuppliedProduct,
  Product,
  Provider,
  Warehouse,
} = require('@dbModels');

const { Op } = require('sequelize');

const { setResponse, paginate } = require('../../../utils');

const listSupplies = async reqQuery => {
  const supplies = await Supply.findAndCountAll({
    where: {
      createdAt: {
        [Op.between]: [
          moment
            .tz(moment.utc(reqQuery.from).format('YYYY-MM-DD'), 'America/Lima')
            .startOf('day')
            .toDate(),
          moment
            .tz(moment.utc(reqQuery.to).format('YYYY-MM-DD'), 'America/Lima')
            .endOf('day')
            .toDate(),
        ],
      },
    },
    order: [['createdAt', 'DESC']],
    include: [
      Warehouse,
      Provider,
      {
        model: SuppliedProduct,
        include: Product,
      },
    ],
    distinct: true,
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });
  supplies.page = reqQuery.page;
  supplies.pageSize = reqQuery.pageSize;
  supplies.pages = _.ceil(supplies.count / supplies.pageSize);
  return setResponse(200, 'Supplies found.', supplies);
};

module.exports = { listSupplies };
