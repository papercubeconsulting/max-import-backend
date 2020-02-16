/* eslint-disable no-underscore-dangle */
const { isCelebrate } = require('celebrate');
const EscapeHtml = require('escape-html');

module.exports = (err, req, res, next) => {
  // If this isn't a Celebrate error, send it to the next error handler
  if (!isCelebrate(err)) return next(err);

  const { joi, meta } = err;

  const result = {
    status: 400,
    error: 'Bad Request',
    message: joi.message,
    validation: {
      source: meta.source,
      keys: [],
    },
  };

  if (joi.details) {
    for (let i = 0; i < joi.details.length; i += 1) {
      const path = joi.details[i].path.join('.');
      result.validation.keys.push(EscapeHtml(path));
    }
  }
  return res.status(400).send(result);
};
