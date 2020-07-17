const express = require('express');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use('/proformas', require('./proforma/proforma.router'));

secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
