const express = require('express');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use('/families', require('./family/family.router'));
router.use('/subfamilies', require('./subfamily/subfamily.router'));
router.use('/elements', require('./element/element.router'));
router.use('/models', require('./model/model.router'));
router.use('/providers', require('./provider/provider.router'));
router.use('/warehouses', require('./warehouse/warehouse.router'));

router.use('/products', require('./product/product.router'));
router.use('/productboxes', require('./productbox/productbox.router'));
router.use('/supplies', require('./supply/supply.router'));

secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
