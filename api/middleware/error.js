/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
const winston = require('winston');

module.exports = function(err, req, res, next) {
  winston.error(err.stack, err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res
      .status(400)
      .send({ status: 400, message: 'Syntaxis error: Probably parsing JSON' });
  }
  res.status(500).send({ status: 500, message: 'Unexpected error happend' });
};
