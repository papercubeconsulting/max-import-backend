const express = require('express');
const { celebrate } = require('celebrate');
const Controller = require('./productBarcode.controller');
const Validator = require('./productBarcode.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();
router.get('/product/:productId', isAble('read', 'inventory'), celebrate(Validator.GetByProductId), Controller.getByProductId);
router.get('/:barcode', isAble('read', 'inventory'), celebrate(Validator.GetByCode), Controller.getByCode);
module.exports = router;
