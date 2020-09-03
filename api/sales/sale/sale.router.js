const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./sale.controller');
const Validator = require('./sale.validator');

const router = express.Router();

router.post('/', celebrate(Validator.Post), Controller.postSale);
router.get('/', celebrate(Validator.List), Controller.listSale);

module.exports = router;
