const express = require('express');

const router = express.Router();

router.use('/families', require('./family/familyRoute'));
router.use('/subfamilies', require('./subfamily/subfamilyRoute'));
router.use('/elements', require('./element/elementRoute'));
router.use('/models', require('./model/modelRoute'));

router.use('/products', require('./product/productRoute'));

module.exports = router;
