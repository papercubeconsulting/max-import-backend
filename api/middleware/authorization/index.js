/* eslint-disable global-require */
const { ForbiddenError } = require('@casl/ability');

const validPermission = (action, subject) => (req, res, next) => {
  ForbiddenError.from(req.permissions).throwUnlessCan(action, subject);
  next();
};

module.exports = {
  ...require('./roles'),
  validPermission,
};
