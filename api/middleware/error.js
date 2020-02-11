/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
const winston = require('winston');

module.exports = function(err, req, res, next) {
    winston.error(err.stack, err);

    res.status(500).send('Something failed.');
};
