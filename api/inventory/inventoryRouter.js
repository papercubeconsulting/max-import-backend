const express = require('express');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use('/families', require('./family/familyRouter'));
router.use('/subfamilies', require('./subfamily/subfamilyRouter'));
router.use('/elements', require('./element/elementRouter'));
router.use('/models', require('./model/modelRouter'));
router.use('/providers', require('./provider/providerRouter'));
router.use('/warehouses', require('./warehouse/warehouseRouter'));

router.use('/products', require('./product/productRouter'));
router.use('/productboxes', require('./productbox/productboxRouter'));
router.use('/supplies', require('./supply/supplyRouter'));

secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
