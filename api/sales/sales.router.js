const express = require('express');

const router = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use(
  '/proformas',
  authenticateMiddleware('jwt'),
  require('./proforma/proforma.router'),
);
router.use(
  '/sales',
  authenticateMiddleware('jwt'),
  require('./sale/sale.router'),
);

module.exports = router;
