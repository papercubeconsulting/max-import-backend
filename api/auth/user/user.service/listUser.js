const _ = require('lodash');
const { User } = require('@dbModels');

const { setResponse, paginate } = require('@root/api/utils');

const noQueryFields = [
  // ? Para paginacion
  'page',
  'pageSize',
];

const listUsers = async reqQuery => {
  const mainQuery = { ..._.omit(reqQuery, noQueryFields) };

  const users = await User.findAndCountAll({
    where: mainQuery,
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
