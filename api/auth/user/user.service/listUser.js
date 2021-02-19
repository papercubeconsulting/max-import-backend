const _ = require('lodash');
const sequelize = require('sequelize');
const { User } = require('@dbModels');

const { setResponse, paginate } = require('@root/api/utils');

const noQueryFields = [
  // ? Para paginacion
  'page',
  'pageSize',
  // ?
  'name',
  'lastname',
];

const listUsers = async reqQuery => {
  const mainQuery = { ..._.omit(reqQuery, noQueryFields) };

  if (reqQuery.name)
    mainQuery.name = sequelize.where(
      sequelize.fn('LOWER', sequelize.col('name')),
      'LIKE',
      `%${reqQuery.name}%`,
    );

  if (reqQuery.lastname)
    mainQuery.lastname = sequelize.where(
      sequelize.fn('LOWER', sequelize.col('lastname')),
      'LIKE',
      `%${reqQuery.lastname}%`,
    );

  const users = await User.findAndCountAll({
    where: mainQuery,
    order: [['createdAt', 'DESC']],
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });

  users.page = reqQuery.page;
  users.pageSize = reqQuery.pageSize;
  users.pages = _.ceil(users.count / users.pageSize);
  return setResponse(200, 'Users found.', users);
};

module.exports = {
  listUsers,
};
