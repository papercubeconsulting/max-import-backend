const express = require('express');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use('/geography', require('./geography/geography.router'));
router.use('/clients', require('./client/client.router'));

secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
