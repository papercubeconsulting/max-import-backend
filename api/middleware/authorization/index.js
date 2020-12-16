/* eslint-disable global-require */
const { ForbiddenError } = require('@casl/ability');

const isAble = (action, subject) => (req, res, next) => {
  ForbiddenError.from(req.permissions).throwUnlessCan(action, subject);
  next();
};

module.exports = {
  ...require('./roles'),
  isAble,
};
