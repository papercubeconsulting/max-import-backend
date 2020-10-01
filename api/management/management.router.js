const express = require('express');

const router = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use(
  '/geography',
  authenticateMiddleware('jwt'),
  require('./geography/geography.router'),
);
router.use(
  '/clients',
  authenticateMiddleware('jwt'),
  require('./client/client.router'),
);
router.use(
  '/banks',
  authenticateMiddleware('jwt'),
  require('./bank/bank.router'),
);
router.use(
  '/deliveryagencies',
  authenticateMiddleware('jwt'),
  require('./deliveryAgency/deliveryAgency.router'),
);

module.exports = router;
