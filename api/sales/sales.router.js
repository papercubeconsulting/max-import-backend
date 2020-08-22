const express = require('express');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use('/proformas', require('./proforma/proforma.router'));
router.use('/sales', require('./sale/sale.router'));

secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
