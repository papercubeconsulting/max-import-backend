const express = require('express');

const router = express.Router();

const { authenticateMiddleware } = require('@/middleware/authentication');

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

router.use(
  '/dispatches',
  authenticateMiddleware('jwt'),
  require('./dispatch/dispatch.router'),
);

module.exports = router;
