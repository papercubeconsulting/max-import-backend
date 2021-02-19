/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
const { setResponse } = require('@/utils');
const { ForbiddenError } = require('@casl/ability');
const winston = require('winston');

module.exports = function(err, req, res, next) {
  winston.error(err.stack, err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res
      .status(400)
      .send(setResponse(400, 'Syntaxis error: Probably parsing JSON'));
  }
  if (err instanceof ForbiddenError) {
    return res.status(403).send(setResponse(403, err.message));
  }

  res
    .status(500)
    .send(
      setResponse(
        500,
        'Unexpected error happend',
        null,
        'Ha ocurrido un error inesperado. Volver a intentar o contactar al equipo de soporte.',
      ),
    );
};
