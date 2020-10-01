const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./warehouse.controller');
const Validator = require('./warehouse.validator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getWarehouse);
router.get('/', celebrate(Validator.List), Controller.listWarehouses);
router.post('/', celebrate(Validator.Post), Controller.postWarehouse);

module.exports = router;
