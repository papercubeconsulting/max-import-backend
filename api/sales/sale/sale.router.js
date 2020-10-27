const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./sale.controller');
const Validator = require('./sale.validator');

const router = express.Router();

router.post('/', celebrate(Validator.Post), Controller.postSale);
router.get('/', celebrate(Validator.List), Controller.listSale);
router.get('/:id', celebrate(Validator.Get), Controller.getSale);
router.put('/:id/pay', celebrate(Validator.PutPay), Controller.paySale);

module.exports = router;
