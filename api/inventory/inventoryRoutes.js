const express = require('express');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use('/families', require('./family/familyRoute'));
router.use('/subfamilies', require('./subfamily/subfamilyRoute'));
router.use('/elements', require('./element/elementRoute'));
router.use('/models', require('./model/modelRoute'));
router.use('/providers', require('./provider/providerRoute'));
router.use('/warehouses', require('./warehouse/warehouseRoute'));

router.use('/products', require('./product/productRoute'));
router.use('/productboxes', require('./productbox/productboxRoute'));
router.use('/supplies', require('./supply/supplyRoute'));

secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
