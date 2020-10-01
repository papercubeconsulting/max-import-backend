const express = require('express');

const router = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use(
  '/families',
  authenticateMiddleware('jwt'),
  require('./family/family.router'),
);
router.use(
  '/subfamilies',
  authenticateMiddleware('jwt'),
  require('./subfamily/subfamily.router'),
);
router.use(
  '/elements',
  authenticateMiddleware('jwt'),
  require('./element/element.router'),
);
router.use(
  '/models',
  authenticateMiddleware('jwt'),
  require('./model/model.router'),
);
router.use(
  '/providers',
  authenticateMiddleware('jwt'),
  require('./provider/provider.router'),
);
router.use(
  '/warehouses',
  authenticateMiddleware('jwt'),
  require('./warehouse/warehouse.router'),
);

router.use(
  '/products',
  authenticateMiddleware('jwt'),
  require('./product/product.router'),
);
router.use(
  '/productboxes',
  authenticateMiddleware('jwt'),
  require('./productbox/productbox.router'),
);
router.use(
  '/supplies',
  authenticateMiddleware('jwt'),
  require('./supply/supply.router'),
);

module.exports = router;
